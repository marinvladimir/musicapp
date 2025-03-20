import Stripe from 'stripe';
import dotenv from 'dotenv';
import { Dropbox } from 'dropbox';
import fetch from 'isomorphic-fetch';

dotenv.config();

const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY);
let dbx = new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_TOKEN, fetch });

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
      body: 'Method Not Allowed',
    };
  }

  try {
    const { sessionId } = JSON.parse(event.body);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      const productNames = JSON.parse(session.metadata.product_names);
      const fileLinks = [];

      for (const productName of productNames) {
        const dropboxFilePath = await getDropboxFileLink(productName);
        console.log(`Dropbox file path for ${productName}:`, dropboxFilePath);

        if (dropboxFilePath) {
          fileLinks.push({ productName, downloadLink: dropboxFilePath });
        } else {
          console.error(`File not found for ${productName}`);
          fileLinks.push({ productName, error: 'File not found in Dropbox' });
        }
      }

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': 'https://marinvladimir.com',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({ fileLinks }),
      };
    } else {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': 'https://marinvladimir.com',
        },
        body: JSON.stringify({ error: 'Payment not successful' }),
      };
    }
  } catch (error) {
    console.error('Error retrieving payment status:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': 'https://marinvladimir.com',
      },
      body: JSON.stringify({ error: 'Failed to retrieve payment status' }),
    };
  }
}

const getDropboxFileLink = async (fileName) => {
  try {
    dbx = new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_TOKEN, fetch });
    let response = await dbx.filesGetMetadata({ path: `/${fileName}` });

    if (response) {
      const sharedLinks = await dbx.sharingListSharedLinks({ path: response.result.path_display });
      if (sharedLinks.result.links.length > 0) {
        return sharedLinks.result.links[0].url.replace('dl=0', 'dl=1');
      } else {
        const sharedLink = await dbx.sharingCreateSharedLinkWithSettings({ path: response.result.path_display });
        return sharedLink.result.url.replace('dl=0', 'dl=1');
      }
    }

    return null;
  } catch (error) {
    if (error.error && error.error.error_summary?.includes('expired_access_token')) {
      console.error('Access token expired. Attempting to refresh.');
      try {
        const newAccessToken = await refreshAccessToken();
        dbx = new Dropbox({ accessToken: newAccessToken, fetch });
        let response = await dbx.filesGetMetadata({ path: `/${fileName}` });

        if (response) {
          const sharedLinks = await dbx.sharingListSharedLinks({ path: response.result.path_display });
          if (sharedLinks.result.links.length > 0) {
            return sharedLinks.result.links[0].url.replace('dl=0', 'dl=1');
          } else {
            const sharedLink = await dbx.sharingCreateSharedLinkWithSettings({ path: response.result.path_display });
            return sharedLink.result.url.replace('dl=0', 'dl=1');
          }
        }
      } catch (err) {
        console.error('Failed to refresh token or fetch Dropbox file:', err);
      }
    } else {
      console.error('Error fetching file from Dropbox:', error);
      return null;
    }
  }
};

const refreshAccessToken = async () => {
  const response = await fetch('https://api.dropboxapi.com/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: process.env.DROPBOX_REFRESH_TOKEN,
      client_id: process.env.DROPBOX_CLIENT_ID,
      client_secret: process.env.DROPBOX_CLIENT_SECRET,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh access token');
  }

  const data = await response.json();
  return data.access_token;
};
