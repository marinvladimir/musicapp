import { Station } from "../store";

// Room size in metres. The origin is the centre of the floor; the back wall
// (with the projection) is at -z.
export const ROOM = { width: 12, depth: 10, height: 3.2 };

export const START_POSITION: [number, number, number] = [0, 1.6, 3.8];
export const START_LOOK_AT: [number, number, number] = [0, 1.4, -3];

// Where the camera flies to for each station, and where it looks.
export const STATIONS: Record<
  Station,
  { position: [number, number, number]; lookAt: [number, number, number] }
> = {
  cv: { position: [0, 1.62, -0.45], lookAt: [0, 1.05, -1.78] },
  projects: { position: [-3.2, 1.45, -0.85], lookAt: [-5.6, 1.2, -0.8] },
  music: { position: [3.05, 1.5, -0.25], lookAt: [5.8, 1.05, -0.25] },
};

// Furniture footprints on the floor (x and z ranges) the visitor cannot walk
// through.
export const OBSTACLES: {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}[] = [
  { minX: -1.05, maxX: 1.05, minZ: -2.9, maxZ: -1.1 }, // CV desk and chair
  { minX: -6, maxX: -4.1, minZ: -2.2, maxZ: 0.6 }, // TV desk and chair
  { minX: 5.4, maxX: 6, minZ: -2.3, maxZ: -0.3 }, // bookshelf
  { minX: 5.2, maxX: 6, minZ: 0.6, maxZ: 2.2 }, // turntable cabinet
];
