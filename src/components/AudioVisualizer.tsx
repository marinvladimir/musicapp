import React, { useEffect, useRef, useState } from "react";
import { VisualizerCard, VisualizerPanel } from "./TurntableStyles";
import { theme } from "../theme";

const BAR_COUNT = 40;
const MIN_FREQUENCY = 40;
const MAX_FREQUENCY = 16000;
const HISTORY_LENGTH = 300; // about 5 seconds at 60 frames per second
const SILENCE_DB = -50;
// Keep drawing briefly after a pause so the bars fall back down smoothly.
const DECAY_MS = 1500;

const toLevel = (db: number) =>
  Math.min(1, Math.max(0, (db - SILENCE_DB) / -SILENCE_DB));

const fitCanvas = (canvas: HTMLCanvasElement) => {
  const ratio = window.devicePixelRatio || 1;
  const width = Math.round(canvas.clientWidth * ratio);
  const height = Math.round(canvas.clientHeight * ratio);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  return { width, height, ratio };
};

const drawSpectrum = (canvas: HTMLCanvasElement, bars: number[]) => {
  const context = canvas.getContext("2d");
  if (!context) return;
  const { width, height, ratio } = fitCanvas(canvas);
  context.clearRect(0, 0, width, height);

  const gap = 3 * ratio;
  const barWidth = (width - gap * (bars.length - 1)) / bars.length;
  const gradient = context.createLinearGradient(0, height, 0, 0);
  gradient.addColorStop(0, theme.colors.accent);
  gradient.addColorStop(1, theme.colors.purple);
  context.fillStyle = gradient;

  bars.forEach((value, index) => {
    const barHeight = Math.max(2 * ratio, value * height);
    context.fillRect(
      index * (barWidth + gap),
      height - barHeight,
      barWidth,
      barHeight,
    );
  });
};

const drawLoudness = (canvas: HTMLCanvasElement, history: number[]) => {
  const context = canvas.getContext("2d");
  if (!context) return;
  const { width, height, ratio } = fitCanvas(canvas);
  context.clearRect(0, 0, width, height);

  // Guide lines at -10, -20, -30 and -40 dB.
  context.strokeStyle = "rgba(255, 255, 255, 0.08)";
  context.lineWidth = ratio;
  for (let db = -10; db > SILENCE_DB; db -= 10) {
    const y = height - toLevel(db) * height;
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }

  const step = width / (HISTORY_LENGTH - 1);
  const offset = HISTORY_LENGTH - history.length;
  context.beginPath();
  context.moveTo(offset * step, height);
  history.forEach((level, index) => {
    context.lineTo((offset + index) * step, height - level * height);
  });
  context.lineTo(width, height);
  context.closePath();

  const fill = context.createLinearGradient(0, 0, 0, height);
  fill.addColorStop(0, "rgba(181, 108, 255, 0.55)");
  fill.addColorStop(1, "rgba(108, 99, 255, 0.05)");
  context.fillStyle = fill;
  context.fill();

  context.beginPath();
  history.forEach((level, index) => {
    const x = (offset + index) * step;
    const y = height - level * height;
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  context.strokeStyle = theme.colors.pink;
  context.lineWidth = 2 * ratio;
  context.stroke();
};

// Groups the analyser's linear frequency bins into bars on a logarithmic
// scale, which matches how we hear pitch.
const getBarRanges = (binCount: number, sampleRate: number) => {
  const binWidth = sampleRate / 2 / binCount;
  return Array.from({ length: BAR_COUNT }, (_, index) => {
    const low =
      MIN_FREQUENCY * (MAX_FREQUENCY / MIN_FREQUENCY) ** (index / BAR_COUNT);
    const high =
      MIN_FREQUENCY *
      (MAX_FREQUENCY / MIN_FREQUENCY) ** ((index + 1) / BAR_COUNT);
    const start = Math.min(binCount - 1, Math.floor(low / binWidth));
    const end = Math.min(
      binCount,
      Math.max(start + 1, Math.ceil(high / binWidth)),
    );
    return [start, end];
  });
};

const AudioVisualizer: React.FC<{
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  glowRef?: React.RefObject<HTMLElement | null>;
}> = ({ analyser, isPlaying, glowRef }) => {
  const spectrumRef = useRef<HTMLCanvasElement | null>(null);
  const loudnessRef = useRef<HTMLCanvasElement | null>(null);
  const historyRef = useRef<number[]>([]);
  const [loudnessDb, setLoudnessDb] = useState<number | null>(null);

  useEffect(() => {
    const spectrum = spectrumRef.current;
    const loudness = loudnessRef.current;
    if (!spectrum || !loudness) return;

    if (!analyser) {
      drawSpectrum(spectrum, new Array(BAR_COUNT).fill(0));
      drawLoudness(loudness, historyRef.current);
      return;
    }

    const frequencies = new Uint8Array(analyser.frequencyBinCount);
    const samples = new Float32Array(analyser.fftSize);
    const ranges = getBarRanges(
      analyser.frequencyBinCount,
      analyser.context.sampleRate,
    );
    const stopAt = isPlaying ? Infinity : performance.now() + DECAY_MS;
    let frame = 0;
    let lastReadout = 0;

    const render = (now: number) => {
      analyser.getByteFrequencyData(frequencies);
      analyser.getFloatTimeDomainData(samples);

      const bars = ranges.map(([start, end]) => {
        let peak = 0;
        for (let i = start; i < end; i++) peak = Math.max(peak, frequencies[i]);
        return peak / 255;
      });

      let sum = 0;
      for (const sample of samples) sum += sample * sample;
      const rms = Math.sqrt(sum / samples.length);
      const db = rms > 0 ? 20 * Math.log10(rms) : -Infinity;
      const level = toLevel(db);

      const history = historyRef.current;
      history.push(level);
      if (history.length > HISTORY_LENGTH) history.shift();

      drawSpectrum(spectrum, bars);
      drawLoudness(loudness, history);
      glowRef?.current?.style.setProperty("--level", level.toFixed(3));

      // Updating the number ten times a second is enough to read it.
      if (now - lastReadout > 100) {
        setLoudnessDb(isFinite(db) && db > SILENCE_DB ? db : null);
        lastReadout = now;
      }

      if (now < stopAt) frame = requestAnimationFrame(render);
    };

    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [analyser, isPlaying, glowRef]);

  return (
    <VisualizerPanel>
      <VisualizerCard>
        <figcaption>
          <span>Spectrum</span>
          <span>40 Hz – 16 kHz</span>
        </figcaption>
        <canvas
          ref={spectrumRef}
          role="img"
          aria-label="Frequency spectrum of the playing song"
        />
      </VisualizerCard>
      <VisualizerCard>
        <figcaption>
          <span>Loudness</span>
          <output aria-live="off">
            {loudnessDb === null ? "– dB" : `${loudnessDb.toFixed(1)} dB`}
          </output>
        </figcaption>
        <canvas
          ref={loudnessRef}
          role="img"
          aria-label="Loudness of the playing song over the last five seconds"
        />
      </VisualizerCard>
    </VisualizerPanel>
  );
};

export default AudioVisualizer;
