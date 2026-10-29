import { useStore } from "../store";
import { Song } from "../types";
import { startTransfer } from "./recordTransfer";

// One audio element for the whole site, routed through an analyser so the
// room can react to the music.
let audio: HTMLAudioElement | null = null;
let context: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
// Fades the music in once the record is on the turntable. A gain node is
// used because iOS ignores the audio element's volume.
let fader: GainNode | null = null;
let startTimer: number | undefined;

const getAudio = () => {
  if (audio) return audio;
  audio = new Audio();
  audio.preload = "none";
  audio.addEventListener("play", () => useStore.setState({ isPlaying: true }));
  audio.addEventListener("pause", () =>
    useStore.setState({ isPlaying: false }),
  );
  audio.addEventListener("timeupdate", () =>
    useStore.setState({ currentTime: audio?.currentTime ?? 0 }),
  );
  audio.addEventListener("loadedmetadata", () =>
    useStore.setState({ duration: audio?.duration ?? 0 }),
  );
  audio.addEventListener("ended", () => {
    if (audio) audio.currentTime = 0;
  });
  return audio;
};

// Browsers only let audio start from a click or tap, so the audio graph is
// created on the first play.
const connect = () => {
  const element = getAudio();
  if (!context) {
    context = new AudioContext();
    analyser = context.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;
    fader = context.createGain();
    context.createMediaElementSource(element).connect(fader);
    fader.connect(analyser);
    analyser.connect(context.destination);
  }
  context.resume();
  return element;
};

export const getAnalyser = () => analyser;

export const playSong = (song: Song, album: string) => {
  const element = connect();
  const previous = useStore.getState().currentSong;
  if (previous?.songName === song.songName) {
    element.play().catch(() => useStore.setState({ isPlaying: false }));
    return;
  }

  // Start the new song silently right away (still inside the click, which
  // browsers require), then rewind and fade it in when the record lands.
  const delay = startTransfer({ ...song, album }, previous);
  window.clearTimeout(startTimer);
  element.src = song.songUrl;
  useStore.setState({
    currentSong: { ...song, album },
    currentTime: 0,
    duration: 0,
  });
  if (fader && context && delay > 0) {
    fader.gain.cancelScheduledValues(context.currentTime);
    fader.gain.setValueAtTime(0, context.currentTime);
  }
  element.play().catch(() => useStore.setState({ isPlaying: false }));
  startTimer = window.setTimeout(() => {
    element.currentTime = 0;
    if (fader && context) {
      fader.gain.cancelScheduledValues(context.currentTime);
      fader.gain.setValueAtTime(fader.gain.value, context.currentTime);
      fader.gain.linearRampToValueAtTime(1, context.currentTime + 0.25);
    }
  }, delay * 1000);
};

export const togglePlayback = () => {
  const { currentSong, isPlaying } = useStore.getState();
  if (!currentSong) return;
  if (isPlaying) {
    getAudio().pause();
  } else {
    connect()
      .play()
      .catch(() => useStore.setState({ isPlaying: false }));
  }
};

export const seek = (fraction: number) => {
  const element = getAudio();
  if (element.duration > 0) element.currentTime = fraction * element.duration;
};

export const setVolume = (volume: number) => {
  getAudio().volume = volume;
  useStore.setState({ volume });
};
