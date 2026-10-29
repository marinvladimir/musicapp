import React from "react";
import styled, { keyframes } from "styled-components";
import { profile } from "../data/cv";

const shimmer = keyframes`
  from { background-position: 0% 50%; }
  to { background-position: 200% 50%; }
`;

const rise = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: none; }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 30;
  display: grid;
  place-items: center;
  padding: 16px;
  overflow-y: auto;
  background: radial-gradient(
    circle at 50% 35%,
    rgba(54, 36, 110, 0.75),
    rgba(10, 10, 20, 0.94) 70%
  );
`;

const Card = styled.div`
  width: 100%;
  max-width: 640px;
  text-align: center;

  > * {
    animation: ${rise} 0.7s ease-out both;
  }

  > *:nth-child(2) {
    animation-delay: 0.08s;
  }

  > *:nth-child(3) {
    animation-delay: 0.16s;
  }

  > *:nth-child(4) {
    animation-delay: 0.24s;
  }

  > *:nth-child(5) {
    animation-delay: 0.32s;
  }

  > *:nth-child(6) {
    animation-delay: 0.4s;
  }

  @media (prefers-reduced-motion: reduce) {
    > * {
      animation: none;
    }
  }
`;

const Photo = styled.img`
  width: 104px;
  height: 104px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid ${({ theme }) => theme.colors.accent};
  box-shadow: 0 0 40px rgba(108, 99, 255, 0.6);
`;

const Name = styled.h1`
  margin-top: 18px;
  font-size: clamp(2.4rem, 9vw, 4rem);
  line-height: 1.05;
  letter-spacing: -0.03em;
  background: linear-gradient(90deg, #ffffff, #c9c5ff, #4fd1c5, #ffffff);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: ${shimmer} 6s linear infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Role = styled.p`
  margin-top: 8px;
  color: #a9a4ff;
  font-size: clamp(1.05rem, 3.5vw, 1.3rem);
  font-weight: 500;
`;

const Facts = styled.ul`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 18px;
  list-style: none;

  li {
    padding: 6px 14px;
    border-radius: 999px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: rgba(27, 27, 46, 0.7);
    color: ${({ theme }) => theme.colors.text};
    font-size: 0.85rem;
  }
`;

const Text = styled.p`
  margin: 18px auto 0;
  max-width: 520px;
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 1.6;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 28px;

  button {
    padding: 13px 24px;
    border-radius: 999px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: transform 0.15s ease;
  }

  button:hover {
    transform: translateY(-1px);
  }

  button:first-child {
    border: none;
    background: linear-gradient(90deg, #6c63ff, #8b5cf6);
    color: #ffffff;
    box-shadow: 0 8px 30px rgba(108, 99, 255, 0.5);
  }

  button:last-child {
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: rgba(27, 27, 46, 0.6);
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Hint = styled.p`
  margin-top: 18px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 0.75rem;
`;

const Intro: React.FC<{ onEnter: () => void; onSkip: () => void }> = ({
  onEnter,
  onSkip,
}) => (
  <Overlay>
    <Card>
      <Photo src={profile.photo} alt="" />
      <Name>{profile.name}</Name>
      <Role>{profile.title}</Role>
      <Facts>
        <li>7+ years shipping production software</li>
        <li>React Native · Next.js · TypeScript</li>
        <li>Remote · {profile.location}</li>
      </Facts>
      <Text>
        Welcome to my room. My CV is on the desk, the projects I built are on
        the TV, and the music I compose is on the shelf.
      </Text>
      <Actions>
        <button onClick={onEnter} autoFocus>
          Enter the room
        </button>
        <button onClick={onSkip}>Just show me the CV</button>
      </Actions>
      <Hint>Best with sound on · drag to look around · WASD to walk</Hint>
    </Card>
  </Overlay>
);

export default Intro;
