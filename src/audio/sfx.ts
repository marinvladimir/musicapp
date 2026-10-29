import { useStore } from "../store";

let context: AudioContext | null = null;
let noise: AudioBuffer | null = null;

// The hiss of an analogue TV between channels, generated rather than loaded.
export const playStatic = (seconds: number) => {
  try {
    context ??= new AudioContext();
    context.resume();
    if (!noise) {
      noise = context.createBuffer(1, context.sampleRate, context.sampleRate);
      const data = noise.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }

    const source = context.createBufferSource();
    source.buffer = noise;
    source.loop = true;
    const filter = context.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 500;
    const gain = context.createGain();
    const volume = 0.12 * useStore.getState().volume;
    const now = context.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.02);
    gain.gain.setValueAtTime(volume, now + seconds - 0.15);
    gain.gain.linearRampToValueAtTime(0, now + seconds);

    source.connect(filter).connect(gain).connect(context.destination);
    source.start(now);
    source.stop(now + seconds);
  } catch {
    // No sound effect without Web Audio; the picture still switches.
  }
};
