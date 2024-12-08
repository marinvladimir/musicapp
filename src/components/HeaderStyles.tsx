import styled from "styled-components";

export const NavigationWrapper = styled.nav`
  display: flex;
  justify-content: center;
  background-color: ${(props) => props.theme.colors.primary};
  padding: 1rem;

  a {
    color: ${(props) => props.theme.colors.textSecondary};
    text-decoration: none;
    font-size: 1.2rem;
    font-weight: bold;
    margin: 0 1.5rem;
    transition:
      color 0.3s ease-in-out,
      transform 0.3s ease-in-out; /* Smooth animation */

    &:hover {
      color: ${(props) => props.theme.colors.accent};
      transform: scale(1.1);
    }
  }

  @media (max-width: 512px) {
    display: none;
  }
`;

export const MobileMenu = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: ${({ $isOpen }) =>
    $isOpen ? "36px" : "-100vh"}; /* Position menu below burger */
  left: 0;
  width: 100%;
  background-color: ${(props) => props.theme.colors.primary};
  padding-top: 2rem;
  padding-bottom: 2rem;
  transition: top 0.3s ease-in-out;
  z-index: 10;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;

  a {
    color: ${(props) => props.theme.colors.textSecondary};
    text-decoration: none;
    font-size: 1.5rem;
    font-weight: bold;
    transition: color 0.3s ease-in-out;

    &:hover {
      color: ${(props) => props.theme.colors.accent};
    }
  }

  @media (min-width: 513px) {
    display: none;
  }
`;

export const BurgerContainer = styled.div`
  display: none;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    transform 0.3s ease,
    box-shadow 0.3s ease;

  @media (max-width: 512px) {
    display: flex;
    justify-content: center;
    padding: 1rem;
    position: relative;
    border-radius: 8px;
  }

  &:hover {
    background-color: ${(props) => props.theme.colors.accent};
    box-shadow: 0 2px 8px rgba(108, 99, 255, 0.5);
  }
`;

export const BurgerIcon = styled.div<{ $isOpen: boolean }>`
  width: 30px;
  height: 3px;
  background-color: ${(props) => props.theme.colors.textPrimary};
  border-radius: 2px;
  position: relative;
  transition: all 0.3s ease-in-out;
  cursor: pointer;

  &::before,
  &::after {
    content: "";
    position: absolute;
    width: 30px;
    height: 3px;
    background-color: ${(props) => props.theme.colors.textPrimary};
    border-radius: 2px;
    transition: all 0.3s ease-in-out;
  }

  &::before {
    top: -10px;
  }

  &::after {
    top: 10px;
  }

  ${({ $isOpen }: { $isOpen: boolean }) =>
    $isOpen &&
    `
      background-color: transparent;

      &::before {
        transform: rotate(45deg);
        top: 0;
      }

      &::after {
        transform: rotate(-45deg);
        top: 0;
      }
    `}
`;

export const TitleWrapper = styled.div`
  background: ${({ theme }) =>
    `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`};
  text-align: center;
  padding: 2rem 1rem;
  font-size: 1.8rem;
  font-weight: bold;
  letter-spacing: 2px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);

  @media (max-width: 1024px) {
    gap: 1rem;
    padding: 0.5rem;

    h1 {
      font-size: 1.2rem;
    }

    svg {
      width: 24px;
      height: 24px;
    }
  }
`;

export const HeaderWrapper = styled.header`
  width: 100%;
  background-color: ${(props) => props.theme.colors.primary};
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
`;

export const NavWrapper = styled.nav`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem;

  a {
    display: inline-block;
    color: inherit;
    text-decoration: none;
    outline: none;

    &:focus-visible {
      outline: 2px solid ${({ theme }) => theme.colors.accent};
      outline-offset: 4px;
    }

    svg {
      width: 32px;
      height: 32px;
      color: ${(props) => props.theme.colors.textSecondary};

      transition:
        transform 0.3s ease,
        color 0.3s ease;

      &:hover {
        color: ${(props) => props.theme.colors.accent};
        transform: scale(1.2);
        filter: drop-shadow(0 0 6px ${({ theme }) => theme.colors.accent});
      }
    }

    @media (max-width: 768px) {
      svg {
        width: 28px;
        height: 28px;
      }
    }
  }
`;
