import React, { useState } from "react";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  YouTubeIcon,
} from "../icons/icons";
import { NavLink } from "react-router-dom";
import {
  BurgerContainer,
  BurgerIcon,
  HeaderWrapper,
  MobileMenu,
  NavigationWrapper,
  NavWrapper,
  TitleWrapper,
} from "./HeaderStyles";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <>
      <NavigationWrapper>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/music">Music</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/contact">Contact</NavLink>
      </NavigationWrapper>

      <BurgerContainer onClick={toggleMenu}>
        <BurgerIcon $isOpen={isMenuOpen} />
      </BurgerContainer>
      <MobileMenu $isOpen={isMenuOpen}>
        <NavLink to="/" onClick={toggleMenu}>
          Home
        </NavLink>
        <NavLink to="/music" onClick={toggleMenu}>
          Music
        </NavLink>
        <NavLink to="/about" onClick={toggleMenu}>
          About
        </NavLink>
        <NavLink to="/contact" onClick={toggleMenu}>
          Contact
        </NavLink>
      </MobileMenu>

      <HeaderWrapper>
        <TitleWrapper>
          <h1>Marna's Music</h1>
        </TitleWrapper>
        <NavWrapper>
          <a
            href="https://www.facebook.com/marnavlado/"
            aria-label="Facebook"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FacebookIcon />
          </a>
          <a
            href="https://www.instagram.com/neclord_marna35/"
            aria-label="Instagram"
            target="_blank"
            rel="noopener noreferrer"
          >
            <InstagramIcon />
          </a>
          <a
            href="https://www.youtube.com/@Vlado54565"
            aria-label="YouTube"
            target="_blank"
            rel="noopener noreferrer"
          >
            <YouTubeIcon />
          </a>
          <a
            href="https://www.linkedin.com/in/marin-vladimir-76b9b4170/"
            aria-label="Facebook"
            target="_blank"
            rel="noopener noreferrer"
          >
            <LinkedInIcon />
          </a>
        </NavWrapper>
      </HeaderWrapper>
    </>
  );
};

export default Header;
