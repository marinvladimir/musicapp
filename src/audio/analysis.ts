import { getAnalyser } from "./player";

export const BAR_COUNT = 40;
export const HISTORY_LENGTH = 300; // 5 seconds at 60 samples per second
const MIN_FREQUENCY = 40;
const MAX_FREQUENCY = 16000;
export const SILENCE_DB = -50;

export const toLevel = (db: number) =>
  Math.min(1, Math.max(0, (db - SILENCE_DB) / -SILENCE_DB));

// Shared, mutable snapshot of the music, updated once per frame by
// `updateAnalysis` and read by everything that visualises it.
export const analysis = {
  bars: new Array<number>(BAR_COUNT).fill(0),
  level: 0,
  db: -Infinity,
  history: [] as number[],
};

let frequencies: Uint8Array | null = null;
let samples: Float32Array | null = null;
let ranges: [number, number][] = [];

// Groups the analyser's linear frequency bins into bars on a logarithmic
// scale, which matches how we hear pitch.
const getBarRanges = (binCount: number, sampleRate: number) => {
  const binWidth = sampleRate / 2 / binCount;
  const ratio = MAX_FREQUENCY / MIN_FREQUENCY;
  return Array.from({ length: BAR_COUNT }, (_, index): [number, number] => {
    const low = MIN_FREQUENCY * ratio ** (index / BAR_COUNT);
    const high = MIN_FREQUENCY * ratio ** ((index + 1) / BAR_COUNT);
    const start = Math.min(binCount - 1, Math.floor(low / binWidth));
    const end = Math.min(
      binCount,
      Math.max(start + 1, Math.ceil(high / binWidth)),
    );
    return [start, end];
  });
};

export const updateAnalysis = (delta: number) => {
  const analyser = getAnalyser();
  if (!analyser) return;
  if (!frequencies || !samples) {
    frequencies = new Uint8Array(analyser.frequencyBinCount);
    samples = new Float32Array(analyser.fftSize);
    ranges = getBarRanges(
      analyser.frequencyBinCount,
      analyser.context.sampleRate,
    );
  }

  analyser.getByteFrequencyData(frequencies);
  analyser.getFloatTimeDomainData(samples);

  ranges.forEach(([start, end], index) => {
    let peak = 0;
    for (let i = start; i < end; i++) peak = Math.max(peak, frequencies![i]);
    analysis.bars[index] = peak / 255;
  });

  let sum = 0;
  for (const sample of samples) sum += sample * sample;
  const rms = Math.sqrt(sum / samples.length);
  analysis.db = rms > 0 ? 20 * Math.log10(rms) : -Infinity;
  analysis.level = toLevel(analysis.db);
  // The history covers a fixed time span, however fast the device renders.
  const samplesToAdd = Math.min(30, Math.max(1, Math.round(delta * 60)));
  for (let i = 0; i < samplesToAdd; i++) analysis.history.push(analysis.level);
  if (analysis.history.length > HISTORY_LENGTH) {
    analysis.history.splice(0, analysis.history.length - HISTORY_LENGTH);
  }
};
