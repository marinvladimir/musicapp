import styled from "styled-components";

export const FooterWrapper = styled.footer`
  background-color: ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.textSecondary};
  text-align: center;
  padding: 1rem;
  width: 100%;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;
