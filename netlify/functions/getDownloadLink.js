import Stripe from 'stripe';
import dotenv from 'dotenv';
import { Dropbox } from 'dropbox';
import fetch from 'isomorphic-fetch';

dotenv.config();

const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY);
const dbx = new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_TOKEN, fetch });

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
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
          console.log(`File not found for ${productName}`);
          console.error(`File not found for ${productName}`);
          fileLinks.push({ productName, error: 'File not found in Dropbox' });
        }
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ fileLinks }),
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
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
}

const getDropboxFileLink = async (fileName) => {
  try {
    const response = await dbx.filesGetMetadata({ path: `/${fileName}` });

    console.log('File Metadata:', response);

    if (response) {
      const sharedLinks = await dbx.sharingListSharedLinks({ path: response.result.path_display });

      if (sharedLinks.result.links.length > 0) {
        const directLink = sharedLinks.result.links[0].url.replace('dl=0', 'dl=1');
        return directLink;
      } else {
        const sharedLink = await dbx.sharingCreateSharedLinkWithSettings({ path: response.result.path_display });
        const directLink = sharedLink.result.url.replace('dl=0', 'dl=1');
        return directLink;
      }
    }
    return null;
  } catch (error) {
    console.error('Error fetching file from Dropbox:', error);
    return null;
  }
};
