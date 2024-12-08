import express from 'express';
import Stripe from 'stripe';

const router = express.Router();
const stripe = new Stripe('sk_test_51QTknkGP3M8LVAgvBbHT699uux9mVfXu5lXVPWMmnKrccLuKJYz7xP2FhIVWOcp24XrclAZjb1HzdZ5OIY2NsJfO00DQm0Yv0T');

router.post('/create-checkout-session', async (req, res) => {
  try {
    const { cart } = req.body;
    const products = await stripe.products.list();

    const lineItems = cart.map((item) => {
      const product = products.data.find(p => p.name === item.name);
      if (!product) {
        throw new Error(`Product not found for ${item.name}`);
      }

      return {
        price_data: {
          currency: 'usd',
          product: product.id,
          unit_amount: item.price,
        },
        quantity: 1,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: 'http://localhost:5173/success',
      cancel_url: 'http://localhost:5173/cancel',
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});


export default router;
