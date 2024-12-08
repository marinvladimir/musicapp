import React from "react";
import VideoCarousel from "../components/VideoCarousel";
import { ContentWrapper } from "./PageStyles";

const MainPage: React.FC = () => {
  return (
    <ContentWrapper>
      <VideoCarousel />
    </ContentWrapper>
  );
};

export default MainPage;
