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
  const stripePromise = loadStripe(
    "pk_test_51QTknkGP3M8LVAgv6KXcu3yVYcbMSzEC22DgD54G5LVR7sAnWIdUsUpTadshMivwFkklUEPpZvODGefpBss6thZt00qH4RNc9E",
  );

  const handleCheckout = async () => {
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe failed to load");

      const updatedCart = cart.map((item) => ({
        name: item.songName,
        price: item.price * 100,
      }));

      const response = await fetch(`${API_BASE_URL}/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart: updatedCart }),
      });

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.error || "Failed to create checkout session");

      const { sessionId } = data;
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        console.error("Error redirecting to Stripe Checkout:", error.message);
      }
    } catch (error) {
      console.error("Error during checkout:", error);
    }
  };

  const calculateTotal = () => {
    return cart.reduce(
      (total, item) => total + parseFloat(item.price.toString()),
      0,
    );
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
