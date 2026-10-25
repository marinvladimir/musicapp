import React from "react";
import { FooterWrapper } from "./FooterStyles";

const Footer: React.FC = () => {
  return (
    <FooterWrapper>
      <p>&copy; {new Date().getFullYear()} Marna All Rights Reserved</p>
    </FooterWrapper>
  );
};

export default Footer;
