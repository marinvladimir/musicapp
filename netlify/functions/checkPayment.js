import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY);

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { sessionId } = JSON.parse(event.body);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      return {
        statusCode: 200,
        body: JSON.stringify({ status: 'success' }),
      };
    } else {
      return {
        statusCode: 200,
        body: JSON.stringify({ status: 'failed' }),
      };
    }
  } catch (error) {
    console.error('Error verifying payment status:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to verify payment status' }),
    };
  }
};
