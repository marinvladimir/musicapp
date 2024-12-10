import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY);

const generateDownloadLink = (session) => {
  return `https://your-bucket-url.com/downloads/song-${session.id}.mp3`;
};

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { sessionId } = JSON.parse(event.body);

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      const downloadLink = generateDownloadLink(session);
      return {
        statusCode: 200,
        body: JSON.stringify({ downloadLink }),
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Payment not successful' }),
      };
    }
  } catch (error) {
    console.error('Error retrieving payment status:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to retrieve payment status' }),
    };
  }
};
