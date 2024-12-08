import styled, { keyframes } from "styled-components";

export const PageWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  flex-direction: column;

  @media (min-width: 1024px) {
    padding: 0 15rem;
  }
`;

export const popIn = keyframes`
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

export const popOut = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0;
  }
  100% {
    transform: scale(0);
    opacity: 0;
  }
`;

export const CartWrapper = styled.div<{ $visible: boolean }>`
  button {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    animation: ${({ $visible }) => ($visible ? popIn : popOut)} 0.5s ease
      forwards;
    visibility: ${({ $visible }) => ($visible ? "visible" : "hidden")};
    opacity: ${({ $visible }) => ($visible ? 1 : 0)};
    pointer-events: ${({ $visible }) => ($visible ? "auto" : "none")};

    &:hover {
      transform: scale(1.1);
    }
  }
`;

export const CartCount = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #ff4d4f;
  color: white;
  font-size: 12px;
  font-weight: bold;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
`;
