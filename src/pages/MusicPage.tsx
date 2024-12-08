import React from "react";
import MusicPlayer from "../components/MusicPlayer";
import { ContentWrapper, MusicContainer } from "./PageStyles";

const MusicPage: React.FC = () => {
  return (
    <ContentWrapper>
      <MusicContainer>
        <MusicPlayer />
      </MusicContainer>
    </ContentWrapper>
  );
};

export default MusicPage;
