import React from "react";
import { ContentWrapper } from "./PageStyles";
import Checkout from "../components/Checkout";
import { useCartContext } from "../states/CartContext";

const CheckoutPage: React.FC = () => {
  const { cart } = useCartContext();
  return (
    <ContentWrapper>
      <h2 style={{ marginBottom: "1rem" }}>Your Cart</h2>
      {cart.length > 0 ? <Checkout /> : <p>Your cart is empty.</p>}
    </ContentWrapper>
  );
};

export default CheckoutPage;
