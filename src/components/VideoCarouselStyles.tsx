import styled from "styled-components";

export const ImageCarouselWrapper = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  background: ${({ theme }) =>
    `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`};
`;

export const ImageWrapper = styled.img<{ $active?: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition:
    opacity 1s ease-in-out,
    transform 1s ease-in-out;
  z-index: ${({ $active }) => ($active ? "1" : "0")};
  opacity: ${({ $active }) => ($active ? "0.8" : "0")};
  transform: ${({ $active }) => ($active ? "scale(1.05)" : "scale(1)")};
`;

export const ImageContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;
