import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  LeftArrow,
  LeftArrowSong,
  LoopIcon,
  PauseSong,
  PlaySong,
  RightArrow,
  RightArrowSong,
  ShuffleIcon,
  VolumeIcon,
} from "../icons/icons";
import {
  AlbumCover,
  AlbumImage,
  AlbumName,
  ButtonArrow,
  ButtonSong,
  MusicWrapper,
  PlayerControls,
  Playlist,
  ProgressBar,
  ProgressBarContainer,
  SongWrapper,
  TimeDisplay,
  ToolButton,
  ToolParent,
  ToolWrapper,
  Volume,
  VolumeWrapper,
} from "./MusicPlayerStyles";
import { useCartContext } from "../states/CartContext";
import Spinner from "../helperComponents/Spinner";
import PlaylistItemComponent from "./PlaylistItemComponent";
import { API_BASE_URL } from "../config";
import { fadeOut, formatTime, getFilePath } from "../utils";

const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedAlbumIndex, setSelectedAlbumIndex] = useState(0);
  const [selectedSongIndex, setSelectedSongIndex] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevSongRef = useRef<string | null>(null);
  const { sessionId, cart, setCart, albums, isLoading } = useCartContext();

  const currentAlbum = albums[selectedAlbumIndex];
  const currentSong = currentAlbum?.songs[selectedSongIndex];
  const progress = (currentTime / duration) * 100;

  const togglePlayPause = useCallback(() => {
    fadeOut(setFadingOut, () => {
      if (!audioRef.current || !currentSong?.songUrl) return;
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.src = currentSong.songUrl;
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
      setIsPlaying(!isPlaying);
    });
  }, [isPlaying, currentSong?.songUrl]);

  const changeAlbum = (delta: number) => {
    fadeOut(setFadingOut, () => {
      setSelectedAlbumIndex(
        (prev) => (prev + delta + albums.length) % albums.length,
      );
      setSelectedSongIndex(0);
      setIsPlaying(false);
    });
  };

  const toggleLoop = () => {
    setIsShuffle(false);
    setIsLooping((prev) => !prev);
    if (audioRef.current) {
      audioRef.current.loop = !isLooping;
    }
  };

  const toggleShuffle = () => {
    setIsLooping(false);
    setIsShuffle((prev) => !prev);
  };

  const changeSong = (delta: number) => {
    setFadingOut(true);
    const currentAlbum = albums[selectedAlbumIndex];

    setTimeout(() => {
      if (isShuffle && currentAlbum.songs.length > 1) {
        let randomIndex;
        do {
          randomIndex = Math.floor(Math.random() * currentAlbum.songs.length);
        } while (randomIndex === selectedSongIndex);
        setSelectedSongIndex(randomIndex);
      } else {
        setSelectedSongIndex(
          (prev) =>
            (prev + delta + currentAlbum.songs.length) %
            currentAlbum.songs.length,
        );
      }
      setFadingOut(false);
    }, 500);
  };

  const handleProgressBarClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    if (!audioRef.current) return;
    const progressBarWidth = event.currentTarget.offsetWidth;
    const clickPosition =
      event.clientX - event.currentTarget.getBoundingClientRect().left;
    const newTime = (clickPosition / progressBarWidth) * duration;
    if (isFinite(newTime) && !isNaN(newTime)) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const addToCart = async (song: {
    songName: string;
    songUrl: string;
    price: number;
  }) => {
    try {
      await fetch(`${API_BASE_URL}/.netlify/functions/postCart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId,
          songName: song.songName,
          songUrl: song.songUrl,
          price: song.price,
        }),
      });
      setCart((prevCart) => [
        ...prevCart,
        { songName: song.songName, price: song.price },
      ]);
    } catch (error) {
      console.error("Error adding song to cart:", error);
    }
  };

  const removeFromCart = async (songName: string) => {
    try {
      await fetch(`${API_BASE_URL}/.netlify/functions/deleteCart`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId,
          songName: songName,
        }),
      });
      setCart((prevCart) =>
        prevCart.filter((item) => item.songName !== songName),
      );
    } catch (error) {
      console.error("Error removing song from cart:", error);
    }
  };

  const toggleCartItem = (song: {
    songName: string;
    songUrl: string;
    price: number;
  }) => {
    const isAlreadyInCart = cart.some(
      (item) => item.songName === song.songName,
    );
    if (isAlreadyInCart) {
      removeFromCart(song.songName);
    } else {
      addToCart(song);
    }
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const newSource = getFilePath(
      currentSong?.songName,
      albums[selectedAlbumIndex]?.albumName,
    );
    if (prevSongRef.current !== currentSong?.songName) {
      if (audio.src !== newSource) {
        audio.src = newSource;
      }
      prevSongRef.current = currentSong?.songName;
    }

    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration);
    };
    const handleSongEnd = () => {
      changeSong(1);
    };

    audio.addEventListener("ended", handleSongEnd);
    audio.addEventListener("timeupdate", updateProgress);
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    }
    audio.loop = isLooping;

    return () => {
      audio.removeEventListener("ended", handleSongEnd);
      audio.removeEventListener("timeupdate", updateProgress);
    };
  }, [selectedSongIndex, currentSong, isPlaying, isShuffle, isLooping]);

  

  return isLoading ? (
    <Spinner />
  ) : (
    <MusicWrapper>
      <audio
        ref={audioRef}
        preload="metadata"
      >
 <source src={currentSong?.songUrl} type="audio/mpeg" />

      </audio>
      <SongWrapper
        $path={
          currentSong?.songName && isPlaying
            ? getFilePath(
                currentSong?.songName.replace(/\.mp3$/, ".png"),
                albums[selectedAlbumIndex]?.albumName,
              )
            : getFilePath(
                "Album_Image.png",
                albums[selectedAlbumIndex]?.albumName,
              )
        }
        $isFadingOut={fadingOut}
      >
        <PlayerControls>
          <ButtonArrow $side="left" onClick={() => changeAlbum(-1)}>
            <LeftArrow />
          </ButtonArrow>
          <AlbumName>{currentAlbum?.albumName?.replace(/_/g, " ")}</AlbumName>
          <ButtonArrow $side="right" onClick={() => changeAlbum(1)}>
            <RightArrow />
          </ButtonArrow>
        </PlayerControls>
        <AlbumCover>
          <AlbumImage
            $active={isPlaying}
            src={getFilePath(
              "Album_Cover.png",
              albums[selectedAlbumIndex]?.albumName,
            )}
          />
        </AlbumCover>
        <div>
          {isPlaying &&
            currentSong?.songName.replace(/_/g, " ").replace(/\.mp3$/, "")}
        </div>
      </SongWrapper>
      <ToolParent>
        <ToolWrapper>
          <VolumeWrapper>
            <VolumeIcon />
          </VolumeWrapper>
          <Volume
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            style={{ marginLeft: "10px", width: "100px" }}
          />
        </ToolWrapper>
        <ToolWrapper>
          <ToolButton onClick={toggleLoop} $isActive={isLooping}>
            <LoopIcon /> <span>Repeat</span>
          </ToolButton>
          <ToolButton onClick={toggleShuffle} $isActive={isShuffle}>
            <ShuffleIcon /> <span>Random</span>
          </ToolButton>
        </ToolWrapper>
      </ToolParent>
      <ProgressBarContainer onClick={handleProgressBarClick}>
        <ProgressBar $progress={progress} />
      </ProgressBarContainer>

      <TimeDisplay>
        {formatTime(currentTime) && <span>{formatTime(currentTime)}</span>}
        {!isNaN(duration) && <span>{formatTime(duration)}</span>}
      </TimeDisplay>

      <PlayerControls $noMargin>
        <ButtonSong $type="play" onClick={() => changeSong(-1)}>
          <LeftArrowSong />
        </ButtonSong>
        <ButtonSong
          $type={isPlaying ? "pause" : "play"}
          onClick={togglePlayPause}
        >
          {isPlaying ? <PauseSong /> : <PlaySong />}
        </ButtonSong>
        <ButtonSong $type="play" onClick={() => changeSong(1)}>
          <RightArrowSong />
        </ButtonSong>
      </PlayerControls>

      <Playlist>
        {currentAlbum?.songs.map((song, index) => (
          <PlaylistItemComponent
            key={index}
            song={song}
            index={index}
            selectedIndex={selectedSongIndex}
            setSelectedIndex={setSelectedSongIndex}
            toggleItem={toggleCartItem}
          />
        ))}
      </Playlist>
    </MusicWrapper>
  );
};

export default MusicPlayer;
