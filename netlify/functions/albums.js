import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const METADATA_URL = `${process.env.VITE_APP_BACKEND_ENDPOINT}/assets/music/metadata.json`;

exports.handler = async (event, context) => {
  try {
    const response = await fetch(METADATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }

    const albums = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(albums),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    };
  } catch (error) {
    console.error('Error fetching album data:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error fetching album data.' }),
    };
  }
};
