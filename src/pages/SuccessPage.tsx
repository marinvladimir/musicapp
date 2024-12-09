import React from "react";
import { ContentWrapper, MusicContainer } from "./PageStyles";
import { NavLink } from "react-router-dom";
import styled from "styled-components";

const CancelNavWrapper = styled.nav`
  display: flex;
  justify-content: center;

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

const SuccessPage: React.FC = () => {
  return (
    <ContentWrapper>
      <MusicContainer>
        <div style={{ marginBottom: "16px" }}>
          Purchase was successful. Go back to home page?
        </div>
        <CancelNavWrapper>
          <NavLink to="/">Back to home</NavLink>
        </CancelNavWrapper>
      </MusicContainer>
    </ContentWrapper>
  );
};

export default SuccessPage;
