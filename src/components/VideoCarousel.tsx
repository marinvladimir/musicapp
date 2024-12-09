import React, { useEffect, useState } from "react";
import {
  ImageCarouselWrapper,
  ImageContainer,
  ImageWrapper,
} from "./VideoCarouselStyles";

const VideoCarousel: React.FC = () => {
  const videoClips = [
    "/assets/videos/music1.gif",
    "/assets/videos/music2.gif",
    "/assets/videos/music3.gif",
  ];

  const [currentVideo, setCurrentVideo] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideo((prev) => (prev + 1) % videoClips.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [videoClips.length]);

  return (
    <ImageCarouselWrapper>
      <ImageContainer>
        {videoClips.map((clip, index) => (
          <ImageWrapper
            key={index}
            $active={index === currentVideo}
            src={clip}
            alt={`Video Clip ${index + 1}`}
          />
        ))}
      </ImageContainer>
    </ImageCarouselWrapper>
  );
};

export default VideoCarousel;
