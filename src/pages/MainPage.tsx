import React from "react";
import VideoCarousel from "../components/VideoCarousel";
import { ContentWrapper } from "./PageStyles";
import styled from "styled-components";

const IntroSection = styled.section`
  padding: 2rem;
  text-align: center;
  background: ${({ theme }) => theme.colors.darkGray};
  color: ${({ theme }) => theme.colors.lightGray};

  h1 {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1rem;
    line-height: 1.6;
    max-width: 800px;
    margin: 0 auto;
    margin-bottom: 1.5rem;
  }
`;

const StyledList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0 auto;
  max-width: 1000px;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  p {
    margin: 0;
  }
`;

const StyledListElm = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border-left: 4px solid ${({ theme }) => theme.colors.tertiary}; 
  background: ${({ theme }) => theme.colors.darkGray}; 
  color: ${({ theme }) => theme.colors.lightGray};
  border-radius: 4px;
  
  @media (max-width: 512px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  div {
    font-size: 2rem;
  }

  span {
    font-size: 1.2rem;
    font-weight: bold;
  }
`;


const Strong = styled.strong`
  color: ${({ theme }) => theme.colors.lightGray};
`;

const MainPage: React.FC = () => {
  return (
    <ContentWrapper>
      <IntroSection>
        <h1>Welcome to My Music Portfolio</h1>
        <p>
          Discover the different sections of my music portfolio below. Each
          section offers a unique glimpse into my world of music and
          compositions.
        </p>
        <StyledList>
          <StyledListElm>
            <div>🎵</div> <Strong>Home Page:</Strong>
            <p>
              {" "}
              A snapshot of my world and a place to catch a glimpse of my work.
            </p>
          </StyledListElm>
          <StyledListElm>
            <div>🎧</div> <Strong>Music Page:</Strong>
            <p>
              {" "}
              Explore my full collection, listen to tracks, and purchase if you
              feel inspired.
            </p>
          </StyledListElm>
          <StyledListElm>
            <div>📖</div> <Strong>About Page:</Strong>
            <p>
              {" "}
              Learn more about my journey, my influences, and the story behind
              my compositions.
            </p>
          </StyledListElm>
        </StyledList>
      </IntroSection>
      <VideoCarousel />
    </ContentWrapper>
  );
};

export default MainPage;
