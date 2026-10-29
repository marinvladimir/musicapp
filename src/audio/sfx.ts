import { useStore } from "../store";

// Sound effects and the room's ambience, all generated with Web Audio, so
// there are no sound files to download. Everything goes through one master
// gain, which the "Sounds" switch turns off.

let context: AudioContext | null = null;
let master: GainNode | null = null;
let whiteNoise: AudioBuffer | null = null;
let brownNoise: AudioBuffer | null = null;
let ambience: { stop: () => void } | null = null;
let crackle: { stop: () => void } | null = null;

const MASTER_VOLUME = 0.8;

const getContext = () => {
  if (!context) {
    context = new AudioContext();
    master = context.createGain();
    master.gain.value = useStore.getState().soundsOn ? MASTER_VOLUME : 0;
    master.connect(context.destination);
  }
  context.resume();
  return { context, master: master! };
};

const getWhiteNoise = (audio: AudioContext) => {
  if (!whiteNoise) {
    whiteNoise = audio.createBuffer(1, audio.sampleRate, audio.sampleRate);
    const data = whiteNoise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return whiteNoise;
};

// Deeper, softer noise: each sample drifts from the last one.
const getBrownNoise = (audio: AudioContext) => {
  if (!brownNoise) {
    brownNoise = audio.createBuffer(1, audio.sampleRate * 2, audio.sampleRate);
    const data = brownNoise.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      data[i] = last * 3.5;
    }
  }
  return brownNoise;
};

// Runs `play`, ignoring browsers without Web Audio: sounds are a bonus.
const safely = <T>(play: () => T): T | null => {
  try {
    return play();
  } catch {
    return null;
  }
};

export const setSoundsEnabled = (on: boolean) =>
  safely(() => {
    if (!context || !master) return;
    master.gain.setTargetAtTime(
      on ? MASTER_VOLUME : 0,
      context.currentTime,
      0.1,
    );
  });

// The hiss of an analogue TV between channels, kept soft.
export const playStatic = (seconds: number) =>
  safely(() => {
    const { context: audio, master: out } = getContext();
    const source = audio.createBufferSource();
    source.buffer = getWhiteNoise(audio);
    source.loop = true;
    const highpass = audio.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 300;
    const lowpass = audio.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 3500;
    const gain = audio.createGain();
    const now = audio.currentTime;
    const volume = 0.035;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.05);
    gain.gain.setValueAtTime(volume, now + seconds * 0.6);
    gain.gain.linearRampToValueAtTime(0, now + seconds);
    source.connect(highpass).connect(lowpass).connect(gain).connect(out);
    source.start(now);
    source.stop(now + seconds);
  });

// Air rushing past while the camera moves between the stations.
export const playWhoosh = (seconds: number) =>
  safely(() => {
    const { context: audio, master: out } = getContext();
    const source = audio.createBufferSource();
    source.buffer = getWhiteNoise(audio);
    source.loop = true;
    const filter = audio.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 0.8;
    const gain = audio.createGain();
    const now = audio.currentTime;
    filter.frequency.setValueAtTime(250, now);
    filter.frequency.exponentialRampToValueAtTime(1400, now + seconds * 0.5);
    filter.frequency.exponentialRampToValueAtTime(300, now + seconds);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.05, now + seconds * 0.45);
    gain.gain.linearRampToValueAtTime(0, now + seconds);
    source.connect(filter).connect(gain).connect(out);
    source.start(now);
    source.stop(now + seconds);
  });

// The soft thump and crackle of a needle landing on a record.
export const playNeedleDrop = () =>
  safely(() => {
    const { context: audio, master: out } = getContext();
    const now = audio.currentTime;
    const thump = audio.createOscillator();
    thump.frequency.setValueAtTime(120, now);
    thump.frequency.exponentialRampToValueAtTime(45, now + 0.12);
    const thumpGain = audio.createGain();
    thumpGain.gain.setValueAtTime(0.12, now);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    thump.connect(thumpGain).connect(out);
    thump.start(now);
    thump.stop(now + 0.16);

    const scratch = audio.createBufferSource();
    scratch.buffer = getWhiteNoise(audio);
    const filter = audio.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 2500;
    const scratchGain = audio.createGain();
    scratchGain.gain.setValueAtTime(0.06, now);
    scratchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    scratch.connect(filter).connect(scratchGain).connect(out);
    scratch.start(now);
    scratch.stop(now + 0.09);
  });

// Quiet hum of the computers in the room.
export const setAmbience = (on: boolean) =>
  safely(() => {
    if (!on) {
      ambience?.stop();
      ambience = null;
      return;
    }
    if (ambience) return;
    const { context: audio, master: out } = getContext();
    const noise = audio.createBufferSource();
    noise.buffer = getBrownNoise(audio);
    noise.loop = true;
    const lowpass = audio.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 400;
    const hum = audio.createOscillator();
    hum.frequency.value = 100;
    const humGain = audio.createGain();
    humGain.gain.value = 0.006;
    const gain = audio.createGain();
    gain.gain.setValueAtTime(0, audio.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, audio.currentTime + 3);
    noise.connect(lowpass).connect(gain);
    hum.connect(humGain).connect(gain);
    gain.connect(out);
    noise.start();
    hum.start();
    ambience = {
      stop: () => {
        gain.gain.setTargetAtTime(0, audio.currentTime, 0.3);
        noise.stop(audio.currentTime + 1.5);
        hum.stop(audio.currentTime + 1.5);
      },
    };
  });

// Surface noise of a record turning with the needle lifted: sparse pops
// over a faint hiss.
export const setCrackle = (on: boolean) =>
  safely(() => {
    if (!on) {
      crackle?.stop();
      crackle = null;
      return;
    }
    if (crackle) return;
    const { context: audio, master: out } = getContext();
    const length = audio.sampleRate * 3;
    const buffer = audio.createBuffer(1, length, audio.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.04;
      if (Math.random() < 0.0004)
        data[i] = (Math.random() > 0.5 ? 1 : -1) * 0.9;
    }
    const source = audio.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = audio.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 3000;
    filter.Q.value = 0.5;
    const gain = audio.createGain();
    gain.gain.setValueAtTime(0, audio.currentTime);
    gain.gain.linearRampToValueAtTime(0.06, audio.currentTime + 0.5);
    source.connect(filter).connect(gain).connect(out);
    source.start();
    crackle = {
      stop: () => {
        gain.gain.setTargetAtTime(0, audio.currentTime, 0.1);
        source.stop(audio.currentTime + 0.6);
      },
    };
  });
