export const formatTime = (time: number) => {
  if (!isFinite(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const albumTitle = (albumName: string) => albumName.replace(/_/g, " ");

// Small WebP copy of the album cover, made by scripts/generateCovers.py.
export const coverUrl = (albumName: string) =>
  `/assets/covers/${albumName}.webp`;

export const formatSongName = (songName: string) =>
  songName.replace(/_/g, " ").replace(/\.mp3$/, "");
