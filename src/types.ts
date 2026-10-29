export interface Song {
  songName: string;
  songUrl: string;
  imageUrl: string | null;
  price: number;
}

export interface Album {
  albumName: string;
  songs: Song[];
}
