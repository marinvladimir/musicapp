// import Stripe from 'stripe';
import dotenv from 'dotenv';
import { Dropbox } from 'dropbox';
import fetch from 'isomorphic-fetch';

dotenv.config();

// const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY);
const dbx = new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_TOKEN, fetch });

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // const { sessionId } = JSON.parse(event.body);
    // const session = await stripe.checkout.sessions.retrieve(sessionId);

    // if (session.payment_status === 'paid') {
    //   const productName = session.metadata.product_name;
    //   const dropboxFilePath = await getDropboxFileLink(productName);

    const listFiles = async () => {
        try {
          const response = await dbx.filesListFolder({ path: '' });
          console.log('Files in Dropbox:', response.result.entries);
        } catch (error) {
          console.error('Error listing files:', error);
        }
      };
    
      listFiles();
    const dropboxFilePath = await getDropboxFileLink('Underwater_Palace.mp3');
    console.log('Dropbox file path:', dropboxFilePath); 

      if (dropboxFilePath) {
        return {
          statusCode: 200,
          body: JSON.stringify({ downloadLink: dropboxFilePath }),
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        };
      } else {
        console.log('File not found in Dropbox');
        console.error('File not found in Dropbox');
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'File not found in Dropbox' }),
        };
      }
    // } else {
    //   return {
    //     statusCode: 400,
    //     body: JSON.stringify({ error: 'Payment not successful' }),
    //   };
    // }
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
  