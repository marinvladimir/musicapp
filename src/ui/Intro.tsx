import React from "react";
import styled from "styled-components";
import { profile } from "../data/cv";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 30;
  display: grid;
  place-items: center;
  padding: 16px;
  background: radial-gradient(
    circle at 50% 40%,
    rgba(36, 24, 74, 0.85),
    rgba(10, 10, 20, 0.95)
  );
`;

const Card = styled.div`
  width: 100%;
  max-width: 520px;
  text-align: center;

  img {
    width: 96px;
    height: 96px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid ${({ theme }) => theme.colors.accent};
  }

  h1 {
    margin-top: 16px;
    font-size: clamp(2rem, 7vw, 3rem);
    line-height: 1.1;
    letter-spacing: -0.02em;
  }

  p {
    margin-top: 10px;
    color: ${({ theme }) => theme.colors.textMuted};
    line-height: 1.6;
  }

  p:first-of-type {
    color: #a9a4ff;
    font-size: 1.1rem;
  }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 28px;

  button {
    padding: 12px 22px;
    border-radius: 999px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
  }

  button:first-child {
    border: none;
    background: ${({ theme }) => theme.colors.accent};
    color: #ffffff;
  }

  button:last-child {
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: transparent;
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Intro: React.FC<{ onEnter: () => void; onSkip: () => void }> = ({
  onEnter,
  onSkip,
}) => (
  <Overlay>
    <Card>
      <img src={profile.photo} alt="" />
      <h1>{profile.name}</h1>
      <p>{profile.title}</p>
      <p>
        Welcome to my room. Walk around to read my CV on the desk, open my
        projects on the computer and listen to my music from the shelf.
      </p>
      <Actions>
        <button onClick={onEnter} autoFocus>
          Enter the room
        </button>
        <button onClick={onSkip}>Just show me the CV</button>
      </Actions>
    </Card>
  </Overlay>
);

export default Intro;
