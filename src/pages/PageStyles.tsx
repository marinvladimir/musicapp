import styled from "styled-components";

export const ContentWrapper = styled.main`
  flex: 1;
  color: ${(props) => props.theme.colors.lightGray};
  padding: 0rem;
  text-align: center;
  background: ${(props) => props.theme.colors.darkBlue};
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease-in-out;

  @media (min-width: 768px) {
    text-align: left;
    padding: 2rem 3rem;
  }

  p {
    font-size: 1.2rem;
    font-weight: 400;
    margin-bottom: 1.5rem;
    line-height: 1.6;
    color: ${(props) => props.theme.colors.bluishGray};
  }
`;

export const MusicContainer = styled.div`
  margin-top: 2rem;
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  @media (min-width: 768px) {
    padding: 0 2rem;
  }
`;
