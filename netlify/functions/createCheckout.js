import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY);

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { cart } = JSON.parse(event.body);

    const products = await stripe.products.list({ limit: 200 });
    const lineItems = cart.map((item) => {
      const product = products.data.find((p) => p.name === item.name);
      if (!product) {
        throw new Error(`Product not found for ${item.name}`);
      }

      return {
        price_data: {
          currency: 'eur',
          product_data: { name: item.name },
          unit_amount: item.price
        },
        quantity: item.quantity || 1,
      };
    });

    const productNames = cart.map((item) => item.name);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.VITE_APP_BACKEND_ENDPOINT}/#/success`,
      cancel_url: `${process.env.VITE_APP_BACKEND_ENDPOINT}/#/cancel`,
      metadata: {
        product_names: JSON.stringify(productNames),
      },
    });


    return {
      statusCode: 200,
      body: JSON.stringify({ sessionId: session.id }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    };
  } catch (error) {
    console.error('Error creating Stripe session:', error.message, error.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Failed to create checkout session' }),
    };
  }
}
