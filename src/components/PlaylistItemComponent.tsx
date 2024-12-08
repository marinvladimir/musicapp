import { CartIcon } from "../icons/icons";
import { useCartContext } from "../states/CartContext";
import { Song } from "../types/global";
import {
  CartButton,
  PlaylistItem,
  PlayListItemWrapper,
  SongCover,
  SongDetails,
  SongName,
} from "./MusicPlayerStyles";

const PlaylistItemComponent: React.FC<{
  song: Song;
  index: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  selectedIndex: number;
  toggleItem: (song: { songName: string; songUrl: string }) => void;
}> = ({ song, index, selectedIndex, setSelectedIndex, toggleItem }) => {
  const { cart } = useCartContext();

  return (
    <PlayListItemWrapper>
      <PlaylistItem
        $active={selectedIndex === index}
        onClick={() => setSelectedIndex(index)}
      >
        <SongDetails>
          <SongCover src={`backend/${song.imageUrl}`} />
          <SongName>
            {index + 1}.{" "}
            {song.songName.replace(/_/g, " ").replace(/\.mp3$/, "")}
          </SongName>
        </SongDetails>
        <CartButton
          $filled={cart.includes(song.songName)}
          onClick={() =>
            toggleItem({
              songName: song.songName,
              songUrl: song.songUrl,
            })
          }
        >
          <CartIcon filled={cart.includes(song.songName)} />
        </CartButton>
      </PlaylistItem>
    </PlayListItemWrapper>
  );
};

export default PlaylistItemComponent;
