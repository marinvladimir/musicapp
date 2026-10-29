import React from "react";
import styled from "styled-components";
import Panel from "./Panel";
import MiniVisualizer from "./MiniVisualizer";
import { useStore } from "../store";
import { playSong, seek, setVolume, togglePlayback } from "../audio/player";
import { albumTitle, coverUrl, formatSongName, formatTime } from "../utils";

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
`;

const AlbumGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;

  button {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 0;
    border: none;
    background: none;
    color: ${({ theme }) => theme.colors.text};
    font-size: 0.8rem;
    text-align: left;
    cursor: pointer;
  }

  img {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 8px;
    object-fit: cover;
    transition: transform 0.2s ease;
  }

  button:hover img {
    transform: scale(1.04);
  }
`;

const AlbumHeader = styled.div`
  display: flex;
  gap: 14px;
  align-items: center;

  img {
    width: 96px;
    height: 96px;
    border-radius: 8px;
    object-fit: cover;
  }

  h3 {
    font-size: 1.2rem;
    line-height: 1.25;
  }

  p {
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.85rem;
  }
`;

const LinkButton = styled.button`
  align-self: flex-start;
  padding: 0;
  border: none;
  background: none;
  color: ${({ theme }) => theme.colors.teal};
  font-size: 0.85rem;
  cursor: pointer;
`;

const Tracks = styled.ol`
  list-style: none;

  button {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 9px 10px;
    border: none;
    border-radius: 8px;
    background: none;
    color: ${({ theme }) => theme.colors.text};
    font-size: 0.9rem;
    text-align: left;
    cursor: pointer;
  }

  button:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  button[aria-current="true"] {
    background: rgba(108, 99, 255, 0.25);
  }

  span:first-child {
    width: 20px;
    color: ${({ theme }) => theme.colors.textMuted};
    font-family: ${({ theme }) => theme.fonts.mono};
    font-size: 0.75rem;
  }
`;

// The playing song's picture fills the card behind the controls.
const NowPlaying = styled.div<{ $art: string | null }>`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  padding-top: ${({ $art }) => ($art ? "150px" : "14px")};
  border-radius: 12px;
  background: ${({ $art, theme }) =>
    $art
      ? `linear-gradient(rgba(18, 18, 31, 0.1), rgba(18, 18, 31, 0.92) 55%), center / cover no-repeat url("${$art}")`
      : theme.colors.background};

  strong {
    font-size: 0.95rem;
  }
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textMuted};

  input {
    flex: 1;
    min-width: 0;
    accent-color: ${({ theme }) => theme.colors.accent};
  }
`;

export const PlayButton = styled.button`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.accent};
  color: #ffffff;
  cursor: pointer;

  svg {
    width: 18px;
    height: 18px;
    fill: currentColor;
  }
`;

export const PlayIcon: React.FC<{ playing: boolean }> = ({ playing }) =>
  playing ? (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );

const MusicPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const {
    albums,
    selectedAlbum,
    selectAlbum,
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
  } = useStore();
  const album = albums.find((item) => item.albumName === selectedAlbum);

  return (
    <Panel title="~/music" variant="drawer" onClose={onClose}>
      <Content>
        {album ? (
          <>
            <LinkButton onClick={() => selectAlbum(null)}>
              ← All albums
            </LinkButton>
            <AlbumHeader>
              <img src={coverUrl(album.albumName)} alt="" />
              <div>
                <h3>{albumTitle(album.albumName)}</h3>
                <p>{album.songs.length} tracks · original music · previews</p>
              </div>
            </AlbumHeader>
            <Tracks>
              {album.songs.map((song, index) => {
                const current = currentSong?.songName === song.songName;
                return (
                  <li key={song.songName}>
                    <button
                      aria-current={current}
                      onClick={() =>
                        current
                          ? togglePlayback()
                          : playSong(song, album.albumName)
                      }
                    >
                      <span>{current && isPlaying ? "▶" : index + 1}</span>
                      <span>{formatSongName(song.songName)}</span>
                    </button>
                  </li>
                );
              })}
            </Tracks>
          </>
        ) : (
          <>
            <p>
              Original music I compose and produce in FL Studio. Pick an album,
              or take a book from the shelf.
            </p>
            <AlbumGrid>
              {albums.map((item) => (
                <button
                  key={item.albumName}
                  onClick={() => selectAlbum(item.albumName)}
                >
                  <img src={coverUrl(item.albumName)} alt="" loading="lazy" />
                  {albumTitle(item.albumName)}
                </button>
              ))}
            </AlbumGrid>
          </>
        )}

        {currentSong && (
          <NowPlaying
            aria-live="polite"
            $art={currentSong.imageUrl ?? coverUrl(currentSong.album)}
          >
            <strong>{formatSongName(currentSong.songName)}</strong>
            <MiniVisualizer />
            <Controls>
              <PlayButton
                onClick={togglePlayback}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                <PlayIcon playing={isPlaying} />
              </PlayButton>
              <span>{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.001"
                value={duration > 0 ? currentTime / duration : 0}
                onChange={(event) => seek(parseFloat(event.target.value))}
                aria-label="Position in song"
              />
              <span>{formatTime(duration)}</span>
            </Controls>
            <Controls>
              <span>VOL</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(event) => setVolume(parseFloat(event.target.value))}
                aria-label="Volume"
              />
            </Controls>
          </NowPlaying>
        )}
      </Content>
    </Panel>
  );
};

export default MusicPanel;
