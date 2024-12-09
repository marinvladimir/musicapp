import Stripe from 'stripe';
require('dotenv').config(); 

const stripe = new Stripe('sk_test_51QTknkGP3M8LVAgvBbHT699uux9mVfXu5lXVPWMmnKrccLuKJYz7xP2FhIVWOcp24XrclAZjb1HzdZ5OIY2NsJfO00DQm0Yv0T');

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { cart } = JSON.parse(event.body);
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
      success_url: `${process.env.VITE_APP_BACKEND_ENDPOINT}/success`,
      cancel_url: `${process.env.VITE_APP_BACKEND_ENDPOINT}/cancel`,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ sessionId: session.id }),
    };
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create checkout session' }),
    };
  }
}
