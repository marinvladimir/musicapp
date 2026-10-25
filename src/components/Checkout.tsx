import React, { useState } from "react";
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

const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_key";
const stripePromise = loadStripe(STRIPE_KEY);

const Checkout: React.FC = () => {
  const { cart, sessionId: cartId, setCart } = useCartContext();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setIsRedirecting(true);
    setCheckoutError(null);
    try {
      // Prices are looked up on the server, so only the song names are sent.
      const updatedCart = cart.map((item) => ({ name: item.songName }));

      const response = await fetch(
        `${API_BASE_URL}/.netlify/functions/createCheckout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cart: updatedCart }),
        },
      );

      const data = await response.json();
      const stripe = await stripePromise;

      if (!stripe) throw new Error("Stripe failed to load");

      if (response.ok) {
        localStorage.setItem("stripeSessionId", data.sessionId);
        const sessionId = data.sessionId;
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) throw error;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error initiating checkout:", error);
      setCheckoutError("Checkout could not be started. Please try again.");
      setIsRedirecting(false);
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
          sessionId: cartId,
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
        <CheckoutButton onClick={handleCheckout} disabled={isRedirecting}>
          {isRedirecting ? "Redirecting..." : "Proceed to Checkout"}
        </CheckoutButton>
        {checkoutError && <p role="alert">{checkoutError}</p>}
      </StyledOrderSummary>
    </>
  );
};

export default Checkout;
