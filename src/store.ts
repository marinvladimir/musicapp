import { create } from "zustand";
import { trackLoading } from "./loading";
import { startBoot } from "./boot";
import { Album, Song } from "./types";

export type Station = "cv" | "projects" | "music";
// A place the camera can stand: a station or the view of the whole room.
export type Spot = Station | "overview";

// Stations from left to right, for the previous / next buttons.
export const STATION_ORDER: Station[] = ["projects", "cv", "music"];

type Move = { forward: boolean; back: boolean; left: boolean; right: boolean };

const PIXEL_MODE_KEY = "pixel-mode";
const SOUNDS_KEY = "sounds";

const readSounds = () => {
  try {
    return localStorage.getItem(SOUNDS_KEY) !== "off";
  } catch {
    return true;
  }
};

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
  // Room ambience and sound effects (not the music).
  soundsOn: boolean;
  // Overlay panel that is open, if any.
  panel: Station | null;
  // Where the camera is flying to; a station's panel opens when it arrives.
  flyTarget: Spot | null;
  // Where the camera stands now.
  location: Spot;
  // Free roam: walk anywhere with the keyboard. Off by default; then the
  // visitor moves between the stations only.
  freeRoam: boolean;
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
  toggleSounds: () => void;
  goTo: (spot: Spot) => void;
  stepStation: (delta: number) => void;
  toggleFreeRoam: () => void;
  arrive: () => void;
  closePanel: () => void;
  selectAlbum: (albumName: string | null) => void;
  setHoverLabel: (label: string | null) => void;
  setTouchMove: (move: Partial<Move>) => void;
};

export const useStore = create<State>((set) => ({
  entered: false,
  pixelMode: readPixelMode(),
  soundsOn: readSounds(),
  panel: null,
  flyTarget: null,
  location: "overview",
  freeRoam: false,
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
  enter: (panel) => {
    startBoot();
    set({ entered: true, panel: panel ?? null });
  },
  togglePixelMode: () =>
    set((state) => {
      try {
        localStorage.setItem(PIXEL_MODE_KEY, state.pixelMode ? "off" : "on");
      } catch {
        // The setting just won't be remembered.
      }
      return { pixelMode: !state.pixelMode };
    }),
  toggleSounds: () =>
    set((state) => {
      try {
        localStorage.setItem(SOUNDS_KEY, state.soundsOn ? "off" : "on");
      } catch {
        // The setting just won't be remembered.
      }
      return { soundsOn: !state.soundsOn };
    }),
  goTo: (spot) => set({ flyTarget: spot, panel: null, hoverLabel: null }),
  stepStation: (delta) =>
    set((state) => {
      const index = STATION_ORDER.indexOf(state.location as Station);
      const next =
        index === -1
          ? delta > 0
            ? 0
            : STATION_ORDER.length - 1
          : (index + delta + STATION_ORDER.length) % STATION_ORDER.length;
      return { flyTarget: STATION_ORDER[next], panel: null, hoverLabel: null };
    }),
  toggleFreeRoam: () =>
    set((state) =>
      state.freeRoam
        ? { freeRoam: false, flyTarget: "overview", panel: null }
        : { freeRoam: true },
    ),
  arrive: () =>
    set((state) => ({
      panel: state.flyTarget === "overview" ? null : state.flyTarget,
      location: state.flyTarget ?? state.location,
      flyTarget: null,
    })),
  closePanel: () => set({ panel: null }),
  selectAlbum: (albumName) => set({ selectedAlbum: albumName }),
  setHoverLabel: (label) => set({ hoverLabel: label }),
  setTouchMove: (move) =>
    set((state) => ({ touchMove: { ...state.touchMove, ...move } })),
}));

export const loadAlbums = () => trackLoading(fetchAlbums());

const fetchAlbums = async () => {
  const response = await fetch("/assets/music/metadata.json");
  if (!response.ok)
    throw new Error(`Failed to load albums: ${response.status}`);
  const albums: Album[] = await response.json();
  useStore.setState({ albums });
};
