import { useStore } from "./store";
import { channels } from "./data/cv";
import { playStatic } from "./audio/sfx";

export const STATIC_SECONDS = 0.7;
// How long the channel number stays on screen after switching.
export const OSD_SECONDS = 2.5;

export const tuneTo = (index: number) => {
  const channel = (index + channels.length) % channels.length;
  useStore.setState({ channel, channelChangedAt: performance.now() });
  playStatic(STATIC_SECONDS);
};

export const changeChannel = (delta: number) =>
  tuneTo(useStore.getState().channel + delta);
