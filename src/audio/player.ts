import { useStore } from "../store";
import { Song } from "../types";

// One audio element for the whole site, routed through an analyser so the
// room can react to the music.
let audio: HTMLAudioElement | null = null;
let context: AudioContext | null = null;
let analyser: AnalyserNode | null = null;

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
    context.createMediaElementSource(element).connect(analyser);
    analyser.connect(context.destination);
  }
  context.resume();
  return element;
};

export const getAnalyser = () => analyser;

export const playSong = (song: Song, album: string) => {
  const element = connect();
  if (useStore.getState().currentSong?.songName !== song.songName) {
    element.src = song.songUrl;
    useStore.setState({
      currentSong: { ...song, album },
      currentTime: 0,
      duration: 0,
    });
  }
  element.play().catch(() => useStore.setState({ isPlaying: false }));
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
