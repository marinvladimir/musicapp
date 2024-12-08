import React from "react";
import styled, { keyframes } from "styled-components";

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerWrapper = styled.div`
  display: inline-block;
  width: 50px;
  height: 50px;
  border: 8px solid ${({ theme }) => theme.colors.borderSpinner};
  border-top: 8px solid ${({ theme }) => theme.colors.accent};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const Spinner: React.FC = () => {
  return <SpinnerWrapper />;
};

export default Spinner;
