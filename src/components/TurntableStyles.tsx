import styled, { css, keyframes } from "styled-components";

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const dropIn = keyframes`
  0% { transform: scale(1.18); opacity: 0; }
  60% { transform: scale(0.98); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
`;

export const TurntableWrapper = styled.div`
  width: 90%;
  max-width: 900px;
  margin: 0 auto 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  color: ${({ theme }) => theme.colors.textPrimary};
  user-select: none;
`;

export const Intro = styled.p`
  text-align: center;
`;

export const StageRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  gap: 1.5rem;
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// The deck keeps a fixed aspect ratio, so every part is positioned in percent
// and the tonearm angles line up with the record at any size.
export const Deck = styled.div<{ $dropTarget: boolean }>`
  --level: 0;
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 18px;
  background: linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.06),
      rgba(0, 0, 0, 0.25)
    ),
    ${({ theme }) => theme.colors.tertiary};
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 12px 30px rgba(0, 0, 0, 0.45),
    0 0 calc(20px + var(--level) * 60px)
      rgba(108, 99, 255, calc(0.15 + var(--level) * 0.6));
  transition: box-shadow 0.08s linear;

  ${({ $dropTarget, theme }) =>
    $dropTarget &&
    css`
      outline: 3px dashed ${theme.colors.purple};
      outline-offset: 6px;
    `}
`;

export const Platter = styled.div<{ $highlight: boolean }>`
  position: absolute;
  left: 6%;
  top: 8%;
  width: 64%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, #3a3a4f 0%, #22222f 70%, #15151f 100%);
  box-shadow:
    inset 0 0 0 4px #4a4a60,
    0 6px 14px rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: box-shadow 0.2s ease;

  ${({ $highlight, theme }) =>
    $highlight &&
    css`
      box-shadow:
        inset 0 0 0 4px ${theme.colors.purple},
        0 0 24px ${theme.colors.accent};
    `}
`;

export const PlatterHint = styled.span`
  max-width: 60%;
  text-align: center;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.bluishGray};
  opacity: 0.8;
`;

const grooves = css`
  background: radial-gradient(
      circle,
      transparent 0 33%,
      rgba(255, 255, 255, 0.04) 33.5%,
      transparent 34%
    ),
    repeating-radial-gradient(
      circle,
      #111 0 2px,
      #1b1b1b 2px 3px,
      #0d0d0d 3px 4px
    );
`;

// Placing the record and spinning it both animate `transform`, so they live on
// two nested elements.
export const RecordSlot = styled.div`
  position: absolute;
  inset: 3%;
  animation: ${dropIn} 0.6s ease-out;
`;

export const Vinyl = styled.div<{ $spinning: boolean; $imageUrl?: string }>`
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  ${grooves}
  box-shadow: 0 0 0 2px #050505;
  animation: ${spin} 1.8s linear infinite;
  animation-play-state: ${({ $spinning }) =>
    $spinning ? "running" : "paused"};

  &::before {
    content: "";
    position: absolute;
    inset: 33%;
    border-radius: 50%;
    background: ${({ $imageUrl, theme }) =>
      $imageUrl
        ? `center / cover no-repeat url("${$imageUrl}")`
        : theme.colors.accent};
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.6);
  }

  &::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    width: 4%;
    height: 4%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: #d9d9e6;
    box-shadow: 0 0 0 2px #333;
  }
`;

// Light reflection on the record. It does not rotate, so the spinning label
// and grooves read as motion underneath it.
export const Sheen = styled.div`
  position: absolute;
  inset: 3%;
  border-radius: 50%;
  pointer-events: none;
  background: conic-gradient(
    from 200deg,
    transparent 0deg,
    rgba(255, 255, 255, 0.1) 30deg,
    transparent 60deg,
    transparent 180deg,
    rgba(255, 255, 255, 0.07) 210deg,
    transparent 240deg
  );
`;

export const TonearmBase = styled.div`
  position: absolute;
  left: 86%;
  top: 16%;
  width: 12%;
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(
    circle,
    #e6e6f0 0 25%,
    #8c8ca3 26% 60%,
    #4a4a60 61%
  );
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  z-index: 2;
`;

export const ArmRest = styled.div`
  position: absolute;
  left: 86%;
  top: 80%;
  width: 4%;
  height: 6%;
  transform: translateX(-50%);
  border-radius: 4px;
  background: #4a4a60;
`;

export const Tonearm = styled.div<{ $angle: number; $moving: boolean }>`
  position: absolute;
  left: 86%;
  top: 16%;
  width: 0;
  height: 66.7%;
  transform-origin: top center;
  transform: rotate(${({ $angle }) => $angle}deg);
  transition: transform ${({ $moving }) => ($moving ? "0.9s" : "0.25s")}
    ease-in-out;
  z-index: 3;
  pointer-events: none;

  &::before {
    content: "";
    position: absolute;
    left: -3px;
    top: 0;
    width: 6px;
    height: 92%;
    border-radius: 3px;
    background: linear-gradient(90deg, #8c8ca3, #e6e6f0, #8c8ca3);
    box-shadow: 2px 3px 6px rgba(0, 0, 0, 0.5);
  }

  &::after {
    content: "";
    position: absolute;
    left: -9px;
    top: 90%;
    width: 18px;
    height: 10%;
    border-radius: 3px 3px 6px 6px;
    background: ${({ theme }) => theme.colors.accent};
    box-shadow: 2px 3px 6px rgba(0, 0, 0, 0.5);
  }
`;

export const StartButton = styled.button<{ $active: boolean }>`
  position: absolute;
  left: 6%;
  bottom: 5%;
  padding: 0.35rem 0.9rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: ${({ $active, theme }) =>
    $active ? theme.colors.accent : theme.colors.secondary};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  z-index: 4;

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.purple};
    outline-offset: 2px;
  }
`;

export const NowPlaying = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.secondary};
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

  h3 {
    font-size: 0.8rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  strong {
    font-size: 1.3rem;
    line-height: 1.3;
  }

  p {
    margin: 0;
    font-size: 0.95rem;
  }
`;

export const Progress = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.85rem;
  font-variant-numeric: tabular-nums;

  div {
    flex: 1;
    height: 6px;
    border-radius: 3px;
    background: ${({ theme }) => theme.colors.darkBlueVariant};
    overflow: hidden;
  }

  div > span {
    display: block;
    height: 100%;
    background: ${({ theme }) => theme.colors.accent};
  }
`;

export const ControlRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;

  input[type="range"] {
    flex: 1;
    min-width: 100px;
    accent-color: ${({ theme }) => theme.colors.accent};
  }

  svg {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
  }
`;

export const SmallButton = styled.button`
  padding: 0.4rem 0.9rem;
  border-radius: 6px;
  border: none;
  background: ${({ theme }) => theme.colors.grayVariant};
  color: ${({ theme }) => theme.colors.purple};
  font-family: inherit;
  font-weight: 700;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

export const CrateHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;

  h2 {
    min-width: 0;
    font-size: 1.3rem;
    text-align: center;
  }
`;

export const Crate = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1.25rem;
  padding: 1.25rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.secondary};
`;

export const RecordButton = styled.button<{ $current: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0;
  border: none;
  background: none;
  color: ${({ theme }) => theme.colors.lightGray};
  font-family: inherit;
  cursor: grab;
  touch-action: none;

  &:active {
    cursor: grabbing;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.purple};
    outline-offset: 4px;
    border-radius: 6px;
  }

  span {
    font-size: 0.85rem;
    line-height: 1.3;
    text-align: center;
  }

  ${({ $current }) =>
    $current &&
    css`
      opacity: 0.45;
    `}
`;

export const Sleeve = styled.div<{ $imageUrl: string }>`
  position: relative;
  width: 100%;
  aspect-ratio: 1;

  &::before {
    content: "";
    position: absolute;
    top: 6%;
    right: 0;
    width: 88%;
    aspect-ratio: 1;
    border-radius: 50%;
    ${grooves}
    transition: transform 0.3s ease;
  }

  &::after {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 88%;
    aspect-ratio: 1;
    border-radius: 4px;
    background: center / cover no-repeat url("${({ $imageUrl }) => $imageUrl}");
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
  }

  ${RecordButton}:hover &::before,
  ${RecordButton}:focus-visible &::before {
    transform: translateX(8%);
  }
`;

export const DragGhost = styled.div<{ $imageUrl: string }>`
  position: fixed;
  left: 0;
  top: 0;
  width: 110px;
  aspect-ratio: 1;
  border-radius: 50%;
  ${grooves}
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6);
  pointer-events: none;
  z-index: 100;

  &::before {
    content: "";
    position: absolute;
    inset: 33%;
    border-radius: 50%;
    background: center / cover no-repeat url("${({ $imageUrl }) => $imageUrl}");
  }
`;

export const VisualizerPanel = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const VisualizerCard = styled.figure`
  margin: 0;
  padding: 1rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.primary};
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

  figcaption {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: 0.8rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  figcaption output {
    font-variant-numeric: tabular-nums;
    letter-spacing: normal;
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  canvas {
    display: block;
    width: 100%;
    height: 160px;
  }
`;
