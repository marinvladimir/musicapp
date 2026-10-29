// The room "powers up" when the visitor enters: lights and screens switch
// on one after another, neon flickers before it settles.
let startedAt = Infinity;

const now = () => performance.now() / 1000;

export const startBoot = () => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  startedAt = reduced ? -Infinity : now();
};

const FLICKER_SECONDS = 0.45;

// 0 (off) to 1 (on) for something that switches on `delay` seconds into the
// boot. With `flicker` it stutters a few times first, like a neon tube.
export const bootLevel = (delay: number, flicker = false) => {
  const t = now() - startedAt - delay;
  if (t < 0) return 0;
  if (!flicker || t > FLICKER_SECONDS) return Math.min(1, t / 0.25);
  return Math.sin(t * 70) * Math.sin(t * 23) > 0.1 ? 1 : 0.1;
};
