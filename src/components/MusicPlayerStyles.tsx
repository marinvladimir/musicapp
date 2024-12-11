import styled from "styled-components";

export const MusicWrapper = styled.div`
  color: ${(props) => props.theme.colors.textPrimary};
  padding: 1rem;
  border-radius: 8px;
  width: 90%;
  max-width: 900px;
  margin: 2rem auto;
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.2);
  background-color: ${(props) => props.theme.colors.musicPlayer};
  animation: gradientAnimation 10s ease infinite;
  display: flex;
  flex-direction: column;

  @keyframes gradientAnimation {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`;

export const PlayerControls = styled.div<{ $noMargin?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin: ${({ $noMargin }) => ($noMargin ? "0 0 2rem 0" : "1rem")};
`;

export const ToolParent = styled.div`
  display: flex;
  justify-content: space-between;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

export const ToolWrapper = styled.div`
  display: flex;
  align-items: center;
  padding-top: 0.5rem;

  span {
    line-height: 1;
    font-size: 0.85rem;
  }

  @media (max-width: 768px) {
    span {
      display: none;
    }
  }
`;

export const ToolButton = styled.button<{ $isActive?: boolean }>`
  margin-left: 10px;
  padding: 5px 10px;
  background-color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.accent : theme.colors.grayVariant};
  color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.grayVariant : theme.colors.purple};
  border: none;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;

  transition:
    background-color 0.3s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;

  ${({ $isActive }) => $isActive && `animation: pulse 1.5s ease-out infinite;`}

  svg {
    width: 20px;
    height: 20px;
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
    }
  }
`;

export const ButtonArrow = styled.button<{ $side?: string }>`
  width: 40px;
  height: 40px;
  background-color: ${(props) => props.theme.colors.grayVariant};
  border-radius: 25px;
  border: 2px solid ${({ theme }) => theme.colors.accent};
  cursor: pointer;
  color: ${(props) => props.theme.colors.accent};
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    background-color: ${(props) => props.theme.colors.accent};
    border-color: ${(props) => props.theme.colors.blueBorder};
    color: ${(props) => props.theme.colors.blueBorderVariant};
    transform: scale(1.15);
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }

  &:active {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
    transform: scale(1.35);
  }

  svg {
    margin: ${({ $side }) =>
      $side === "left" ? "0px 2px 0px 0px" : "0px 0px 0px 2px"};
    width: 20px;
    transition: color 0.2s ease;
  }
`;

export const CartDetails = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column-reverse;
  font-size: 0.75rem;
  gap: 0.5rem;
`;

export const CartButton = styled.button<{ $filled: boolean }>`
  color: ${({ theme, $filled }) =>
    $filled ? theme.colors.textPrimary : theme.colors.purple};
  background-color: ${({ theme, $filled }) =>
    $filled ? theme.colors.purple : theme.colors.transparent};
  border: 2px solid ${({ theme }) => theme.colors.purple};
  border-radius: 50%;
  min-width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${({ theme, $filled }) =>
      $filled ? theme.colors.blueBorder : theme.colors.purple};
    color: ${(props) => props.theme.colors.textPrimary};
    transform: scale(1.15);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 5px rgba(108, 99, 255, 0.7);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 20px;
    height: 20px;
    stroke: currentColor;
    fill: currentColor;
  }
`;

export const ButtonSong = styled.button<{ $type?: string }>`
  width: 30px;
  height: 30px;
  background-color: ${(props) => props.theme.colors.transparent};
  border: 2px solid ${({ theme }) => theme.colors.accent};
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  transform-origin: center;
  color: ${(props) => props.theme.colors.accent};
  position: relative;

  &:hover {
    background-color: ${(props) => props.theme.colors.accent};
    color: ${(props) => props.theme.colors.textPrimary};
    transform: scale(1.2);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 5px rgba(108, 99, 255, 0.7);
  }

  &:active {
    transform: scale(0.9);
  }

  svg {
    width: 20px;
    height: 20px;
    fill: none;
    stroke: currentColor;
    stroke-width: ${({ $type }) => ($type === "play" ? "4" : "2")};
    transition: all 0.3s ease;
  }
`;

export const Playlist = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const PlaylistItem = styled.div<{ $active?: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 5px;
  justify-content: space-between;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition:
    background-color 0.3s ease,
    transform 0.3s ease;
  gap: 0.5rem;
  width: 100%;

  &:hover {
    background-color: ${({ theme, $active }) =>
      $active ? theme.colors.accent : theme.colors.darkBlueVariant};
  }

  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.accent : theme.colors.secondary};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.textPrimary : theme.colors.pink};
  font-weight: ${({ $active }) => ($active ? "bold" : "")};
  animation: ${({ $active }) => ($active ? "pulse 1.2s infinite;" : "")};

  text-shadow:
    0 0 5px rgba(0, 0, 0, 0.5),
    0 0 10px rgba(0, 0, 0, 0.5);

  @keyframes pulse {
    0% {
      box-shadow: 0 0 4px rgba(108, 99, 255, 0.6);
    }
    50% {
      box-shadow: 0 0 8px rgba(108, 99, 255, 0.8);
    }
    100% {
      box-shadow: 0 0 4px rgba(108, 99, 255, 0.6);
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

export const SongCover = styled.img`
  flex: 1;
  background-color: ${(props) => props.theme.colors.darkBlueVariant};
  max-width: 100px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    align-self: center;
    margin-top: 0.5rem;
    max-width: 80px;
  }
`;

export const SongName = styled.div`
  @media (max-width: 768px) {
    align-self: center;
  }
`;

export const SongDetails = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

export const PlayListItemWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  flex-grow: 1;
`;

export const AlbumCover = styled.div`
  display: flex;
  justify-content: center;
  padding: 1rem 0rem 2.5rem 0rem;

  @keyframes rotateImage {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

export const AlbumImage = styled.img<{ $active?: boolean }>`
  animation: ${({ $active }) =>
    $active ? "rotateImage 20s linear infinite;" : ""};
`;

export const VolumeWrapper = styled.div`
  display: flex;
  svg {
    width: 20px;
    height: 20px;
    fill: none;
    stroke: currentColor;
    transition: all 0.3s ease;
  }
`;

export const Volume = styled.input`
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border-radius: 1rem;
  background: ${(props) => props.theme.colors.grayVariant};
  outline: none;
  transition: background 0.3s ease;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    background: ${(props) => props.theme.colors.purple};
    cursor: pointer;
  }
  &:hover {
    background: ${(props) => props.theme.colors.accent};
  }
`;

export const SongWrapper = styled.div<{
  $path?: string;
  $isFadingOut?: boolean;
}>`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 300px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.accent};
  background-color: ${(props) => props.theme.colors.textPrimary};
  overflow: hidden;
  background-image: ${({ $path }) =>
    $path
      ? `linear-gradient(rgba(135,135, 165, 0.8), rgba(30, 30, 47, 0.5)), url(${$path})`
      : "none"};
  background-size: cover;
  background-position: center;
  opacity: ${({ $isFadingOut }) => ($isFadingOut ? 0.1 : 1)};
  transition: opacity 0.5s ease-in-out;
`;

export const ProgressBarContainer = styled.div`
  margin-top: 1rem;
  width: 100%;
  height: 10px;
  background-color: ${(props) => props.theme.colors.grayVariant};
  border-radius: 5px;
  position: relative;
  cursor: pointer;
`;

export const ProgressBar = styled.div<{ $progress?: number }>`
  height: 100%;
  background-color: ${(props) => props.theme.colors.accent};
  border-radius: 5px;
  width: ${({ $progress }) => $progress}%;
  transition: width 0.2s ease;
`;

export const TimeDisplay = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.grayVariant};
  margin-top: 0.25rem;
`;

export const AlbumName = styled.h3`
  @media (max-width: 512px) {
    display: none;
  }
  width: 15rem;
  text-align: center;
`;

export const AlbumNameMobile = styled.h6`
  width: 5rem;
   @media (min-width: 513px) {
    display: none;
  }
`