import { Color } from "three";

// A colour brighter than white, so the bloom effect makes it glow.
export const neon = (hex: string, intensity = 3) =>
  new Color(hex).multiplyScalar(intensity);
