import React from "react";
import { useCartContext } from "../states/CartContext";
import {
  CheckoutButton,
  StyledCartButton,
  StyledCartItem,
  StyledCartList,
  StyledOrderSummary,
  StyledParagraph,
} from "./CheckoutStyles";
import { API_BASE_URL } from "../config";

const Checkout: React.FC = () => {
  const { cart, sessionId, setCart } = useCartContext();
  const handleCheckout = () => {
    console.log("Proceeding with checkout...");
  };

  const calculateTotal = () => {
    const itemPrice = 1.99;
    return cart.length * itemPrice;
  };

  const removeFromCart = async (songName: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/cart`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId,
          songName: songName,
        }),
      });
      setCart((prevCart) => prevCart.filter((item) => item !== songName));
    } catch (error) {
      console.error("Error removing song from cart:", error);
    }
  };

  return (
    <>
      <StyledCartList>
        {cart.map((item) => (
          <StyledCartItem key={item}>
            <span>{item.replace(/_/g, " ").replace(/\.mp3$/, "")}</span>
            <StyledCartButton onClick={() => removeFromCart(item)}>
              Remove
            </StyledCartButton>
          </StyledCartItem>
        ))}
      </StyledCartList>
      <StyledOrderSummary>
        <h3>Order Summary</h3>
        <StyledParagraph>
          <span>Total Items:</span>
          <span>{cart.length}</span>
        </StyledParagraph>
        <StyledParagraph>
          <span>Total Price:</span>
          <span>${calculateTotal()}</span>
        </StyledParagraph>
        <CheckoutButton onClick={handleCheckout}>
          Proceed to Checkout
        </CheckoutButton>
      </StyledOrderSummary>
    </>
  );
};

export default Checkout;
