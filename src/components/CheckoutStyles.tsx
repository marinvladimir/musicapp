import styled, { keyframes } from "styled-components";

export const CartList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const CartItem = styled.li`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  border-radius: 8px;

  & span {
    word-wrap: break-word;
  }
`;

export const OrderSummary = styled.div`
  padding: 1rem;
  background: #eaeaea;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const CheckoutButton = styled.button`
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.accent};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  width: 80%;
  align-self: center;
  font-weight: bold;
  transition:
    transform 0.2s ease-in-out,
    box-shadow 0.2s ease-in-out,
    background-color 0.2s ease-in-out;

  &:hover {
    background-color: #5a54d6;
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
`;

export const StyledOrderSummary = styled(OrderSummary)`
  background-color: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.textPrimary};
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  border: 1px solid ${({ theme }) => theme.colors.blueBorder};
  padding: ${({ theme }) => theme.spacing.large};
  border-radius: 12px;
  transition: box-shadow 0.3s;
  justify-self: center;
  width: 50%;

  &:hover {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  }

  h3 {
    font-size: ${({ theme }) => theme.typography.headingFontSize};
    color: ${({ theme }) => theme.colors.accent};
    margin-bottom: ${({ theme }) => theme.spacing.medium};
  }
`;

export const StyledParagraph = styled.p`
  font-size: ${({ theme }) => theme.typography.bodyFontSize};
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid ${({ theme }) => theme.colors.blueBorder};
  padding-bottom: ${({ theme }) => theme.spacing.small};
  margin-bottom: ${({ theme }) => theme.spacing.medium};

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

export const StyledCartList = styled(CartList)`
  background-color: ${({ theme }) => theme.colors.secondary};
  padding: ${({ theme }) => theme.spacing.medium};
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  margin-bottom: ${({ theme }) => theme.spacing.large};
`;

export const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const StyledCartButton = styled.button`
  background-color: ${({ theme }) => theme.colors.accent};
  border: none;
  color: ${({ theme }) => theme.colors.textPrimary};
  padding: ${({ theme }) => theme.spacing.small};
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.blueBorderVariant};
  }
`;

export const StyledCartItem = styled(CartItem)`
  animation: ${fadeInUp} 0.3s ease-in-out;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.medium};
  background-color: ${({ theme }) => theme.colors.darkBlueVariant};
  color: ${({ theme }) => theme.colors.textPrimary};
  border: 1px solid ${({ theme }) => theme.colors.blueBorder};
  border-radius: 8px;
  transition:
    background-color 0.3s,
    box-shadow 0.3s;
  margin-bottom: ${({ theme }) => theme.spacing.small};

  &:hover {
    background-color: ${({ theme }) => theme.colors.darkBlue};
    box-shadow: 0 0 8px ${({ theme }) => theme.colors.blueBorderVariant};
  }

  span {
    word-wrap: break-word;
    font-size: ${({ theme }) => theme.typography.bodyFontSize};
  }
`;
