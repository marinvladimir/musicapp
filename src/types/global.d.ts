export interface Song {
  songUrl: string;
  songName: string;
  imageUrl: string;
}

interface Album {
  albumName: string;
  songs: Song[];
}

interface CartContextType {
  sessionId: string;
  cart: string[];
  setCart: React.Dispatch<React.SetStateAction<string[]>>;
  albums: Album[];
  setAlbums: React.Dispatch<React.SetStateAction<Album[]>>;
  isLoading: Boolean;
}

interface CartProviderProps {
  children: ReactNode;
}
