import Stripe from 'stripe';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || process.env.VITE_STRIPE_SECRET_KEY);
const METADATA_URL = `${process.env.VITE_APP_BACKEND_ENDPOINT}/assets/music/metadata.json`;

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://marinvladimir.com',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type', 
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': 'https://marinvladimir.com',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { cart } = JSON.parse(event.body);

    if (!Array.isArray(cart) || cart.length === 0) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': 'https://marinvladimir.com',
        },
        body: JSON.stringify({ error: 'Cart is empty' }),
      };
    }

    const [products, prices] = await Promise.all([fetchAllProducts(), fetchSongPrices()]);
    // Each song is a digital download, so it can only be bought once per order.
    const productNames = [...new Set(cart.map((item) => item.name))];

    const lineItems = productNames.map((name) => {
      const product = products.find((p) => p.name === name);
      const price = prices.get(name);
      if (!product || price === undefined) {
        throw new Error(`Product not found for ${name}`);
      }

      // The price always comes from the server-side catalogue, never from the client.
      return {
        price_data: {
          currency: 'eur',
          product_data: { name },
          unit_amount: Math.round(price * 100),
        },
        quantity: 1,
      };
    });

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
      headers: {
        'Access-Control-Allow-Origin': 'https://marinvladimir.com',
      },
      body: JSON.stringify({ sessionId: session.id }),
    };
  } catch (error) {
    console.error('Error creating Stripe session:', error.message, error.stack);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': 'https://marinvladimir.com',
      },
      body: JSON.stringify({ error: error.message || 'Failed to create checkout session' }),
    };
  }
}

async function fetchAllProducts() {
  let products = [];
  let hasMore = true;
  let lastProductId = null;

  while (hasMore) {
    const response = await stripe.products.list({
      limit: 100,
      starting_after: lastProductId || undefined,
    });

    products = products.concat(response.data);
    hasMore = response.has_more;
    if (hasMore) {
      lastProductId = response.data[response.data.length - 1].id;
    }
  }

  return products;
}

async function fetchSongPrices() {
  const response = await fetch(METADATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch metadata: ${response.statusText}`);
  }

  const albums = await response.json();
  const prices = new Map();
  for (const album of albums) {
    for (const song of album.songs) {
      prices.set(song.songName, song.price);
    }
  }

  return prices;
}
