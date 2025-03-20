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
      headers: {
        'Access-Control-Allow-Origin': 'https://marinvladimir.com', 
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type', 
      },
      body: JSON.stringify(albums),
    };
  } catch (error) {
    console.error('Error fetching album data:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': 'https://marinvladimir.com',
      },
      body: JSON.stringify({ error: 'Error fetching album data.' }),
    };
  }
};
