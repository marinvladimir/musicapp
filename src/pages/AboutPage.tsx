import React from "react";
import styled from "styled-components";

export const ContentWrapperAboutPage = styled.main`
  flex: 1;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.lightGray};
  background: ${({ theme }) => theme.colors.darkBlue};
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease-in-out;

  @media (min-width: 768px) {
    padding: 3rem;
  }
`;

export const AboutContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin: 2rem auto;
  max-width: 1200px;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

export const AboutSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: left;
`;

export const Heading = styled.h2`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.accent};
`;

export const AboutPara = styled.p`
  font-size: 1.2rem;
  line-height: 1.8;
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors.bluishGray};
`;

export const ImageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Image = styled.img`
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease-in-out;

  &:hover {
    transform: scale(1.05);
  }
`;

const AboutPage: React.FC = () => {
  return (
    <ContentWrapperAboutPage>
      <AboutContainer>
        <ImageContainer>
          <Image src="/assets/pics/1.jpg" alt="Playing the cello" />
        </ImageContainer>
        <AboutSection>
          <Heading>My Journey in Music</Heading>
          <AboutPara>
            My musical journey began when I was 10 years old, a curious child
            eager to create. I attended music school, where I learned to play
            the cello, an instrument that quickly became my favorite. It has a
            sound like no other - rich, soulful, and capable of expressing a
            wide range of emotions. Alongside my formal education, I began
            composing music, inspired by classical works and the nostalgic
            scores of old-school RPGs.
          </AboutPara>
        </AboutSection>
      </AboutContainer>
      <AboutContainer>
        <AboutSection>
          <Heading>Balancing Passion and Profession</Heading>
          <AboutPara>
            While I pursued a formal education in a gymnasium for high school
            and later earned a degree in electrical engineering, music was
            always a part of my life. My days were often split between studying
            more technical-oriented subjects like mathematics and physics and
            finding solace in music. The discipline I learned from my academic
            journey complemented my artistic side, allowing me to approach music
            with both structure and spontaneity, in my free time of course.
          </AboutPara>
        </AboutSection>
        <ImageContainer>
          <Image src="/assets/pics/2.jpg" alt="Highschool" />
        </ImageContainer>
      </AboutContainer>
      <AboutContainer>
        <ImageContainer>
          <Image src="/assets/pics/3.JPG" alt="College" />
        </ImageContainer>
        <AboutSection>
          <Heading>The Meaning Behind My Music</Heading>
          <AboutPara>
            Even during my university years, where time was often scarce, I
            found moments to compose melodies and reflect on how music remained
            my important companion. Today, I work as a software developer, but
            my passion for composing music has never faded. Balancing two
            worlds, technology and art, has shaped me in unique ways, allowing
            me to approach my compositions with structure and creativity. For
            me, music is more than just sound: it’s a way of describing
            emotions, telling stories, and connecting with others. Each piece I
            compose is deeply personal, reflecting moments, feelings, and ideas
            that I hope will resonate with you.
          </AboutPara>
        </AboutSection>
      </AboutContainer>
      <AboutContainer>
        <AboutSection>
          <Heading>A Huge Thank You</Heading>
          <AboutPara>
            Thank you for joining me on this journey. Your support means the
            world to me, as it allows me to share not just my music but a part
            of who I am. Every track I compose, every melody I write, carries
            fragments of my experiences, my dreams, and my hopes. I pour my
            heart into every note, hoping it reaches and connects with others in
            meaningful ways. Whether you’re here to explore, listen, or find
            inspiration, your presence is invaluable. Music has a unique power
            to bridge distances and bring people together, and I’m deeply
            grateful to be able to share this with you. Please feel free to
            explore the other pages, listen to the compositions, or reach out to
            me via contact form. Cheers!
          </AboutPara>
        </AboutSection>
        <ImageContainer>
          <Image src="/assets/pics/4.jpg" alt="Nowadays" />
        </ImageContainer>
      </AboutContainer>
    </ContentWrapperAboutPage>
  );
};

export default AboutPage;
