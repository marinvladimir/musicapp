import { create } from "zustand";
import { Album, Song } from "./types";

export type Station = "cv" | "projects" | "music";

type Move = { forward: boolean; back: boolean; left: boolean; right: boolean };

const PIXEL_MODE_KEY = "pixel-mode";

const readPixelMode = () => {
  try {
    return localStorage.getItem(PIXEL_MODE_KEY) === "on";
  } catch {
    return false;
  }
};

type State = {
  // Whether the visitor has left the intro screen.
  entered: boolean;
  // Retro look: the room is rendered at a low resolution, pixel art style.
  pixelMode: boolean;
  // Overlay panel that is open, if any.
  panel: Station | null;
  // Station the camera is flying to; the panel opens when it arrives.
  flyTarget: Station | null;
  hoverLabel: string | null;
  albums: Album[];
  selectedAlbum: string | null;
  currentSong: (Song & { album: string }) | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  // Movement requested by the on-screen touch pad.
  touchMove: Move;
  // TV channel (index into `channels`) and when it last changed, from
  // performance.now(), so the static can be timed.
  channel: number;
  channelChangedAt: number;
  enter: (panel?: Station) => void;
  togglePixelMode: () => void;
  goTo: (station: Station) => void;
  arrive: () => void;
  closePanel: () => void;
  selectAlbum: (albumName: string | null) => void;
  setHoverLabel: (label: string | null) => void;
  setTouchMove: (move: Partial<Move>) => void;
};

export const useStore = create<State>((set) => ({
  entered: false,
  pixelMode: readPixelMode(),
  panel: null,
  flyTarget: null,
  hoverLabel: null,
  albums: [],
  selectedAlbum: null,
  currentSong: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  touchMove: { forward: false, back: false, left: false, right: false },
  channel: 0,
  channelChangedAt: -Infinity,
  enter: (panel) => set({ entered: true, panel: panel ?? null }),
  togglePixelMode: () =>
    set((state) => {
      try {
        localStorage.setItem(PIXEL_MODE_KEY, state.pixelMode ? "off" : "on");
      } catch {
        // The setting just won't be remembered.
      }
      return { pixelMode: !state.pixelMode };
    }),
  goTo: (station) => set({ flyTarget: station, panel: null, hoverLabel: null }),
  arrive: () => set((state) => ({ panel: state.flyTarget, flyTarget: null })),
  closePanel: () => set({ panel: null }),
  selectAlbum: (albumName) => set({ selectedAlbum: albumName }),
  setHoverLabel: (label) => set({ hoverLabel: label }),
  setTouchMove: (move) =>
    set((state) => ({ touchMove: { ...state.touchMove, ...move } })),
}));

export const loadAlbums = async () => {
  const response = await fetch("/assets/music/metadata.json");
  if (!response.ok)
    throw new Error(`Failed to load albums: ${response.status}`);
  const albums: Album[] = await response.json();
  useStore.setState({ albums });
};
