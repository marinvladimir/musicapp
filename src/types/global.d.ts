export interface Song {
  songUrl: string;
  songName: string;
  imageUrl: string;
  price: number;
}

interface Album {
  albumName: string;
  songs: Song[];
}

interface CartContextType {
  sessionId: string;
  cart: {
    songName: string;
    price: number;
  }[];
  setCart: React.Dispatch<
    React.SetStateAction<
      {
        songName: string;
        price: number;
      }[]
    >
  >;
  albums: Album[];
  setAlbums: React.Dispatch<React.SetStateAction<Album[]>>;
  isLoading: boolean;
}

interface CartProviderProps {
  children: ReactNode;
}
