const BASE_PATH = import.meta.env.VITE_FILE_BASE_PATH || 'backend/assets/music/';
export const getFilePath = (type: string, albumName: string) =>
  `${BASE_PATH}/${albumName}/${type}`;

export const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const fadeOut = (
  setFadingOut: React.Dispatch<React.SetStateAction<boolean>>,
  callback: () => void,
) => {
  setFadingOut(true);
  setTimeout(() => {
    callback();
    setFadingOut(false);
  }, 500);
};
