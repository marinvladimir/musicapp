import { useEffect, useState } from "react";

// Counts the downloads the room needs (fonts, pictures, the album list) so
// the loading screen can show real progress.
let started = 0;
let finished = 0;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

export const trackLoading = <T>(promise: Promise<T>): Promise<T> => {
  started++;
  notify();
  const done = () => {
    finished++;
    notify();
  };
  promise.then(done, done);
  return promise;
};

// Progress from 0 to 1. It never goes backwards, even when new downloads
// start after earlier ones have finished.
export const useLoadingProgress = () => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () =>
      setProgress((previous) =>
        Math.max(previous, started === 0 ? 0 : finished / started),
      );
    listeners.add(update);
    update();
    return () => {
      listeners.delete(update);
    };
  }, []);
  return { progress, done: started > 0 && finished === started };
};
