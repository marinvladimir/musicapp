import React, { useCallback, useEffect, useRef, useState } from "react";
import { useCartContext } from "../states/CartContext";
import { Song } from "../types/global";
import Spinner from "../helperComponents/Spinner";
import AudioVisualizer from "./AudioVisualizer";
import { LeftArrow, RightArrow, VolumeIcon } from "../icons/icons";
import { ButtonArrow } from "./MusicPlayerStyles";
import { formatSongName, formatTime } from "../utils";
import {
  ArmRest,
  ControlRow,
  Crate,
  CrateHeader,
  Deck,
  DragGhost,
  Intro,
  NowPlaying,
  Platter,
  PlatterHint,
  Progress,
  RecordButton,
  RecordSlot,
  Sheen,
  Sleeve,
  SmallButton,
  StageRow,
  StartButton,
  Tonearm,
  TonearmBase,
  TurntableWrapper,
  Vinyl,
} from "./TurntableStyles";

type Phase = "empty" | "cueing" | "playing" | "paused";

// Tonearm angles in degrees: 0 is the rest position, the needle lands on the
// outer groove at START and moves inwards to END as the song plays.
const ARM_START = 30;
const ARM_END = 42;
// How long the tonearm takes to reach the record before the music starts.
const CUE_DELAY_MS = 1000;
// How far the pointer has to move before a press turns into a drag.
const DRAG_THRESHOLD = 6;

type Drag = {
  song: Song;
  pointerId: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
  active: boolean;
  overDeck: boolean;
};

const Turntable: React.FC = () => {
  const { albums, isLoading } = useCartContext();
  const [albumIndex, setAlbumIndex] = useState(0);
  const [record, setRecord] = useState<{ song: Song; album: string } | null>(
    null,
  );
  const [phase, setPhase] = useState<Phase>("empty");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const deckRef = useRef<HTMLDivElement | null>(null);
  const cueTimerRef = useRef<number | undefined>(undefined);
  const cueTokenRef = useRef(0);
  const suppressClickRef = useRef(false);

  const album = albums[albumIndex];

  // Browsers only allow audio to start from a user gesture, so the audio graph
  // is created the first time someone puts a record on.
  const connectAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audioContextRef.current) {
      const context = new AudioContext();
      const node = context.createAnalyser();
      node.fftSize = 2048;
      node.smoothingTimeConstant = 0.8;
      context.createMediaElementSource(audio).connect(node);
      node.connect(context.destination);
      audioContextRef.current = context;
      setAnalyser(node);
    }
    audioContextRef.current.resume();
  };

  const cue = (restart: boolean) => {
    const audio = audioRef.current;
    if (!audio) return;
    const token = ++cueTokenRef.current;
    let started = false;
    window.clearTimeout(cueTimerRef.current);
    setPhase("cueing");

    // Start the element muted right away, while we are still inside the click
    // or drop, so that Safari also lets it play once the needle lands.
    audio.muted = true;
    audio
      .play()
      .then(() => {
        if (!started && cueTokenRef.current === token) audio.pause();
      })
      .catch(() => {});

    cueTimerRef.current = window.setTimeout(() => {
      if (cueTokenRef.current !== token) return;
      started = true;
      if (restart) audio.currentTime = 0;
      audio.muted = false;
      audio
        .play()
        .then(() => setPhase("playing"))
        .catch(() => setPhase("paused"));
    }, CUE_DELAY_MS);
  };

  const loadRecord = (song: Song, albumName: string) => {
    const audio = audioRef.current;
    if (!audio) return;
    connectAudio();
    audio.pause();
    audio.src = song.songUrl;
    setCurrentTime(0);
    setDuration(0);
    setRecord({ song, album: albumName });
    cue(true);
  };

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio || !record) return;
    if (phase === "playing" || phase === "cueing") {
      cueTokenRef.current++;
      window.clearTimeout(cueTimerRef.current);
      audio.pause();
      setPhase("paused");
    } else {
      connectAudio();
      cue(false);
    }
  };

  const eject = () => {
    const audio = audioRef.current;
    cueTokenRef.current++;
    window.clearTimeout(cueTimerRef.current);
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    setRecord(null);
    setPhase("empty");
    setCurrentTime(0);
    setDuration(0);
  };

  const changeAlbum = (delta: number) =>
    setAlbumIndex((prev) => (prev + delta + albums.length) % albums.length);

  const isOverDeck = (x: number, y: number) => {
    const rect = deckRef.current?.getBoundingClientRect();
    return (
      !!rect &&
      x >= rect.left &&
      x <= rect.right &&
      y >= rect.top &&
      y <= rect.bottom
    );
  };

  const handlePointerDown = (
    event: React.PointerEvent<HTMLButtonElement>,
    song: Song,
  ) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({
      song,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      x: event.clientX,
      y: event.clientY,
      active: false,
      overDeck: false,
    });
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const moved = Math.hypot(
      event.clientX - drag.startX,
      event.clientY - drag.startY,
    );
    setDrag({
      ...drag,
      x: event.clientX,
      y: event.clientY,
      active: drag.active || moved > DRAG_THRESHOLD,
      overDeck: isOverDeck(event.clientX, event.clientY),
    });
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (drag.active) {
      // A drag ends with a click event too; it should not load the record twice.
      suppressClickRef.current = true;
      if (isOverDeck(event.clientX, event.clientY) && album) {
        loadRecord(drag.song, album.albumName);
      }
    }
    setDrag(null);
  };

  // Clicking, tapping or pressing Enter on a record puts it straight on.
  const handleRecordClick = (song: Song) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    if (album) loadRecord(song, album.albumName);
  };

  const handleEnded = useCallback(() => {
    if (audioRef.current) audioRef.current.currentTime = 0;
    setCurrentTime(0);
    setPhase("paused");
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      window.clearTimeout(cueTimerRef.current);
      audio?.pause();
      audioContextRef.current?.close();
      audioContextRef.current = null;
    };
  }, []);

  if (isLoading) return <Spinner />;

  const isSpinning = phase === "playing" || phase === "cueing";
  const progress = duration > 0 ? currentTime / duration : 0;
  const armAngle = isSpinning
    ? ARM_START + (ARM_END - ARM_START) * progress
    : 0;

  return (
    <TurntableWrapper>
      <Intro>
        Pick a record from the crate and drag it onto the turntable, or just tap
        it.
      </Intro>

      <StageRow>
        <Deck ref={deckRef} $dropTarget={!!drag?.active} aria-label="Turntable">
          <Platter $highlight={!!drag?.overDeck}>
            {record ? (
              <RecordSlot key={record.song.songName}>
                <Vinyl
                  $spinning={isSpinning}
                  $imageUrl={record.song.imageUrl}
                />
              </RecordSlot>
            ) : (
              <PlatterHint>Drop a record here</PlatterHint>
            )}
            {record && <Sheen />}
          </Platter>
          <ArmRest />
          <TonearmBase />
          <Tonearm $angle={armAngle} $moving={phase !== "playing"} />
          <StartButton
            $active={isSpinning}
            onClick={togglePlayback}
            disabled={!record}
          >
            {isSpinning ? "Stop" : "Start"}
          </StartButton>
        </Deck>

        <NowPlaying aria-live="polite">
          <h3>Now playing</h3>
          <strong>
            {record ? formatSongName(record.song.songName) : "Nothing yet"}
          </strong>
          {record && <p>{record.album.replace(/_/g, " ")}</p>}
          <Progress aria-hidden={!record}>
            <span>{formatTime(currentTime)}</span>
            <div>
              <span style={{ width: `${progress * 100}%` }} />
            </div>
            <span>{formatTime(duration)}</span>
          </Progress>
          <ControlRow>
            <VolumeIcon />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(event) => setVolume(parseFloat(event.target.value))}
              aria-label="Volume"
            />
            <SmallButton onClick={eject} disabled={!record}>
              Eject
            </SmallButton>
          </ControlRow>
        </NowPlaying>
      </StageRow>

      <AudioVisualizer
        analyser={analyser}
        isPlaying={phase === "playing"}
        glowRef={deckRef}
      />

      <CrateHeader>
        <ButtonArrow
          $side="left"
          onClick={() => changeAlbum(-1)}
          aria-label="Previous album"
        >
          <LeftArrow />
        </ButtonArrow>
        <h2>{album?.albumName.replace(/_/g, " ")}</h2>
        <ButtonArrow
          $side="right"
          onClick={() => changeAlbum(1)}
          aria-label="Next album"
        >
          <RightArrow />
        </ButtonArrow>
      </CrateHeader>

      <Crate>
        {album?.songs.map((song) => (
          <RecordButton
            key={song.songName}
            $current={record?.song.songName === song.songName}
            onPointerDown={(event) => handlePointerDown(event, song)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => setDrag(null)}
            onClick={() => handleRecordClick(song)}
            aria-label={`Play ${formatSongName(song.songName)}`}
          >
            <Sleeve $imageUrl={song.imageUrl} />
            <span>{formatSongName(song.songName)}</span>
          </RecordButton>
        ))}
      </Crate>

      {drag?.active && (
        <DragGhost
          $imageUrl={drag.song.imageUrl}
          style={{ transform: `translate(${drag.x - 55}px, ${drag.y - 55}px)` }}
        />
      )}

      <audio
        ref={audioRef}
        preload="none"
        onTimeUpdate={(event) =>
          setCurrentTime(event.currentTarget.currentTime)
        }
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onEnded={handleEnded}
      />
    </TurntableWrapper>
  );
};

export default Turntable;
