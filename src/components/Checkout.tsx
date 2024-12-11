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
import { loadStripe } from "@stripe/stripe-js";

const Checkout: React.FC = () => {
  const { cart, sessionId, setCart } = useCartContext();
  const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_key";
  const stripePromise = loadStripe(`${STRIPE_KEY}`);

  const handleCheckout = async () => {
    try {
      const updatedCart = cart.map((item) => ({
        name: item.songName,
        price: item.price * 100,
      }));

      const response = await fetch(
        `${API_BASE_URL}/.netlify/functions/createCheckout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cart: updatedCart }),
        },
      );

      const data = await response.json();

    if (response.ok) {
      localStorage.setItem('stripeSessionId', data.sessionId);
      window.location.href = data.checkoutUrl; 
    } else {
      console.error('Error initiating checkout:', data.error);
    }
  } catch (error) {
    console.error('Error initiating checkout:', error);
  }
  };

  const calculateTotal = () => {
    const total = cart.reduce(
      (total, item) => total + parseFloat(item.price.toString()),
      0,
    );
    return parseFloat(total.toFixed(2));
  };

  const removeFromCart = async (songName: string) => {
    try {
      await fetch(`${API_BASE_URL}/.netlify/functions/deleteCart`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId,
          songName: songName,
        }),
      });
      setCart((prevCart) =>
        prevCart.filter((item) => item.songName !== songName),
      );
    } catch (error) {
      console.error("Error removing song from cart:", error);
    }
  };

  return (
    <>
      <StyledCartList>
        {cart.map((item) => (
          <StyledCartItem key={item.songName}>
            <span>
              {item.songName.replace(/_/g, " ").replace(/\.mp3$/, "")}
            </span>
            <StyledCartButton onClick={() => removeFromCart(item.songName)}>
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
          <span>€{calculateTotal()}</span>
        </StyledParagraph>
        <CheckoutButton onClick={handleCheckout}>
          Proceed to Checkout
        </CheckoutButton>
      </StyledOrderSummary>
    </>
  );
};

export default Checkout;
