const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

exports.handler = async (event, context) => {
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

  const { sessionId } = JSON.parse(event.body || '{}');

  if (!sessionId) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': 'https://marinvladimir.com',
      },
      body: JSON.stringify({ error: 'Missing sessionId' }),
    };
  }

  try {
    const { data, error } = await supabase
      .from('cart')
      .delete()
      .eq('session_id', sessionId);

    if (error) {
      throw error;
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://marinvladimir.com',
      },
      body: JSON.stringify({ message: 'All items removed from cart.' }),
    };
  } catch (error) {
    console.error('Error removing all items from cart:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': 'https://marinvladimir.com',
      },
      body: JSON.stringify({ error: 'Failed to remove items from cart.' }),
    };
  }
};
