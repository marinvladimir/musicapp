import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useLoadingProgress } from "../loading";

// How long everything must stay loaded before the screen goes, since some
// downloads (album covers) only start after others (the album list) finish.
const SETTLE_MS = 500;
const MIN_VISIBLE_MS = 900;

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 24px rgba(108, 99, 255, 0.5); }
  50% { box-shadow: 0 0 48px rgba(79, 209, 197, 0.7); }
`;

const Overlay = styled.div<{ $leaving: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 40;
  display: grid;
  place-items: center;
  background: #0c0c16;
  opacity: ${({ $leaving }) => ($leaving ? 0 : 1)};
  transition: opacity 0.6s ease;
  pointer-events: ${({ $leaving }) => ($leaving ? "none" : "auto")};
`;

const Box = styled.div`
  width: min(320px, calc(100vw - 32px));
  text-align: center;
  font-family: ${({ theme }) => theme.fonts.mono};
`;

const Logo = styled.div`
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  margin: 0 auto 24px;
  border-radius: 18px;
  border: 2px solid ${({ theme }) => theme.colors.accent};
  color: #ffffff;
  font-family: ${({ theme }) => theme.fonts.sans};
  font-size: 1.6rem;
  font-weight: 700;
  animation: ${pulse} 2s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Label = styled.p`
  display: flex;
  justify-content: space-between;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.8rem;

  span:last-child {
    color: ${({ theme }) => theme.colors.teal};
    font-variant-numeric: tabular-nums;
  }
`;

const Track = styled.div`
  height: 4px;
  margin-top: 10px;
  border-radius: 2px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);

  div {
    height: 100%;
    background: linear-gradient(90deg, #6c63ff, #4fd1c5);
    transition: width 0.3s ease;
  }
`;

const LoadingScreen: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const { progress, done } = useLoadingProgress();
  const [shownAt] = useState(() => performance.now());
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!done) return;
    const wait = Math.max(
      SETTLE_MS,
      MIN_VISIBLE_MS - (performance.now() - shownAt),
    );
    const timer = window.setTimeout(() => setLeaving(true), wait);
    return () => window.clearTimeout(timer);
  }, [done, shownAt]);

  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(onDone, 600);
    return () => window.clearTimeout(timer);
  }, [leaving, onDone]);

  const percent = Math.round((leaving ? 1 : Math.min(progress, 0.99)) * 100);

  return (
    <Overlay $leaving={leaving} role="status" aria-live="polite">
      <Box>
        <Logo aria-hidden>MV</Logo>
        <Label>
          <span>{percent < 100 ? "Setting up the room…" : "Ready"}</span>
          <span>{percent}%</span>
        </Label>
        <Track>
          <div style={{ width: `${percent}%` }} />
        </Track>
      </Box>
    </Overlay>
  );
};

export default LoadingScreen;
