import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { profile } from "../data/cv";
import { Station, useStore } from "../store";
import { togglePlayback } from "../audio/player";
import { formatSongName } from "../utils";
import { PlayButton, PlayIcon } from "./MusicPanel";

const Bar = styled.header`
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 10;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  pointer-events: none;

  > * {
    pointer-events: auto;
  }
`;

const Name = styled.button`
  padding: 0;
  border: none;
  background: none;
  color: ${({ theme }) => theme.colors.text};
  text-align: left;
  cursor: pointer;

  strong {
    display: block;
    font-size: 1.15rem;
  }

  span {
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.8rem;
  }
`;

const Nav = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  button {
    padding: 8px 14px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 999px;
    background: rgba(27, 27, 46, 0.8);
    backdrop-filter: blur(6px);
    color: ${({ theme }) => theme.colors.text};
    font-size: 0.85rem;
    cursor: pointer;
  }

  button:hover,
  button[aria-pressed="true"] {
    border-color: ${({ theme }) => theme.colors.accent};
    background: ${({ theme }) => theme.colors.accent};
  }
`;

const Divider = styled.span`
  width: 1px;
  margin: 4px 2px;
  background: ${({ theme }) => theme.colors.border};

  @media (max-width: 640px) {
    display: none;
  }
`;

const Contact = styled.a`
  padding: 8px 14px;
  border-radius: 999px;
  background: linear-gradient(90deg, #6c63ff, #4fd1c5);
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 500;
  text-decoration: none;
  box-shadow: 0 0 18px rgba(108, 99, 255, 0.5);

  @media (max-width: 640px) {
    display: none;
  }
`;

const fadeInOut = keyframes`
  0% { opacity: 0; transform: translate(-50%, 10px); }
  8%, 85% { opacity: 1; transform: translate(-50%, 0); }
  100% { opacity: 0; transform: translate(-50%, 0); }
`;

const Tip = styled.div`
  position: fixed;
  left: 50%;
  bottom: 84px;
  z-index: 10;
  padding: 10px 18px;
  border-radius: 999px;
  background: rgba(27, 27, 46, 0.9);
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.85rem;
  white-space: nowrap;
  pointer-events: none;
  animation: ${fadeInOut} 8s ease forwards;

  @media (max-width: 640px) {
    bottom: 140px;
    white-space: normal;
    width: calc(100% - 32px);
    text-align: center;
    border-radius: 14px;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const StationBar = styled.nav`
  position: fixed;
  left: 50%;
  bottom: 16px;
  z-index: 10;
  display: flex;
  gap: 4px;
  max-width: calc(100vw - 32px);
  padding: 5px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: rgba(27, 27, 46, 0.85);
  backdrop-filter: blur(8px);
  transform: translateX(-50%);

  button {
    padding: 7px 13px;
    border: none;
    border-radius: 999px;
    background: transparent;
    color: ${({ theme }) => theme.colors.text};
    font-size: 0.85rem;
    white-space: nowrap;
    cursor: pointer;
  }

  button:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  button[aria-pressed="true"] {
    background: ${({ theme }) => theme.colors.accent};
  }

  @media (max-width: 480px) {
    button {
      padding: 7px 9px;
      font-size: 0.8rem;
    }
  }
`;

const HoverLabel = styled.div`
  position: fixed;
  left: 50%;
  bottom: 84px;
  z-index: 10;
  transform: translateX(-50%);
  padding: 8px 16px;
  border-radius: 999px;
  background: rgba(108, 99, 255, 0.9);
  color: #ffffff;
  font-size: 0.9rem;
  pointer-events: none;
  white-space: nowrap;
`;

const Help = styled.p`
  position: fixed;
  left: 16px;
  bottom: 16px;
  z-index: 5;
  color: ${({ theme }) => theme.colors.textMuted};
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 0.75rem;
  pointer-events: none;
  max-width: calc(50vw - 260px);

  @media (pointer: coarse), (max-width: 1100px) {
    display: none;
  }
`;

const Pad = styled.div`
  position: fixed;
  left: 16px;
  bottom: 16px;
  z-index: 10;
  display: none;
  grid-template-columns: repeat(3, 48px);
  grid-template-rows: repeat(2, 48px);
  gap: 6px;

  button {
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 12px;
    background: rgba(27, 27, 46, 0.75);
    color: ${({ theme }) => theme.colors.text};
    font-size: 1.1rem;
    touch-action: none;
    user-select: none;
  }

  @media (pointer: coarse) {
    display: grid;
  }
`;

const MiniPlayer = styled.div`
  position: fixed;
  right: 16px;
  bottom: 16px;

  /* Above the station bar where they would overlap */
  @media (max-width: 1000px) {
    bottom: 72px;
  }

  z-index: 10;
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: min(320px, calc(100vw - 220px));
  padding: 8px 14px 8px 8px;
  border-radius: 999px;
  background: rgba(27, 27, 46, 0.85);
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.85rem;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const STATIONS: { id: Station; label: string }[] = [
  { id: "cv", label: "CV" },
  { id: "projects", label: "Projects" },
  { id: "music", label: "Music" },
];

const PAD_BUTTONS = [
  { label: "↑", move: "forward", column: 2, row: 1 },
  { label: "←", move: "left", column: 1, row: 2 },
  { label: "↓", move: "back", column: 2, row: 2 },
  { label: "→", move: "right", column: 3, row: 2 },
] as const;

const Hud: React.FC = () => {
  const {
    panel,
    goTo,
    hoverLabel,
    currentSong,
    isPlaying,
    setTouchMove,
    pixelMode,
    togglePixelMode,
    soundsOn,
    toggleSounds,
    freeRoam,
    toggleFreeRoam,
    location,
    stepStation,
  } = useStore();
  const [showTip, setShowTip] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowTip(false), 8000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <Bar>
        <Name onClick={() => goTo("cv")}>
          <strong>Marin Vladimir</strong>
          <span>Senior Full-Stack & Mobile Engineer</span>
        </Name>
        <Nav aria-label="Rooms">
          {STATIONS.map((station) => (
            <button
              key={station.id}
              aria-pressed={panel === station.id}
              onClick={() => goTo(station.id)}
            >
              {station.label}
            </button>
          ))}
          <Divider aria-hidden />
          <button
            aria-pressed={freeRoam}
            onClick={toggleFreeRoam}
            title="Walk freely with WASD or the on-screen arrows"
          >
            Free roam
          </button>
          <button
            aria-pressed={soundsOn}
            onClick={toggleSounds}
            title="Room ambience and sound effects"
          >
            Sounds
          </button>
          <button
            aria-pressed={pixelMode}
            onClick={togglePixelMode}
            title="Pixel art look"
          >
            Pixel
          </button>
          <Contact href={`mailto:${profile.email}`}>Contact me</Contact>
        </Nav>
      </Bar>

      {showTip && !panel && !hoverLabel && (
        <Tip role="status">
          Tip: click a glowing ring to walk there, or use ← → to visit each
          spot.
        </Tip>
      )}

      {hoverLabel && !panel && <HoverLabel>{hoverLabel}</HoverLabel>}

      <Help>
        {freeRoam
          ? "Drag to look · WASD / arrows to walk · Shift to run · click things"
          : "Click a glowing ring or object · ← → to switch · ↓ for the whole room"}
      </Help>

      {!freeRoam && (
        <StationBar aria-label="Stations">
          <button onClick={() => stepStation(-1)} aria-label="Previous station">
            ◀
          </button>
          <button
            aria-pressed={location === "overview"}
            onClick={() => goTo("overview")}
          >
            Room
          </button>
          {STATIONS.map((station) => (
            <button
              key={station.id}
              aria-pressed={location === station.id}
              onClick={() => goTo(station.id)}
            >
              {station.label}
            </button>
          ))}
          <button onClick={() => stepStation(1)} aria-label="Next station">
            ▶
          </button>
        </StationBar>
      )}

      {freeRoam && (
        <Pad aria-hidden>
          {PAD_BUTTONS.map((button) => (
            <button
              key={button.move}
              style={{ gridColumn: button.column, gridRow: button.row }}
              onPointerDown={() => setTouchMove({ [button.move]: true })}
              onPointerUp={() => setTouchMove({ [button.move]: false })}
              onPointerLeave={() => setTouchMove({ [button.move]: false })}
              onPointerCancel={() => setTouchMove({ [button.move]: false })}
              onContextMenu={(event) => event.preventDefault()}
            >
              {button.label}
            </button>
          ))}
        </Pad>
      )}

      {currentSong && panel !== "music" && (
        <MiniPlayer>
          <PlayButton
            onClick={togglePlayback}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            <PlayIcon playing={isPlaying} />
          </PlayButton>
          <span>{formatSongName(currentSong.songName)}</span>
        </MiniPlayer>
      )}
    </>
  );
};

export default Hud;
