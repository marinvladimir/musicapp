import React from "react";
import { ContentWrapper, MusicContainer } from "./PageStyles";

const AboutPage: React.FC = () => {
  return (
    <ContentWrapper>
      <MusicContainer>
        <p style={{ textAlign: "center" }}>
          "It is only shallow people who require years to get rid of an emotion.
          A man who is master of himself can end a sorrow as easily as he can
          invent a pleasure. I don't want to be at the mercy of my emotions. I
          want to use them, to enjoy them, and to dominate them." - Oscar Wilde,
          The Picture of Dorian Gray
        </p>
      </MusicContainer>
    </ContentWrapper>
  );
};

export default AboutPage;
