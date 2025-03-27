const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://marinvladimir.com',
        'Access-Control-Allow-Methods': 'DELETE, OPTIONS', 
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'DELETE') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': 'https://marinvladimir.com',
      },
      body: 'Method Not Allowed',
    };
  }

  try {
    const { sessionId, songName } = JSON.parse(event.body); 

    if (!sessionId || !songName) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': 'https://marinvladimir.com',
        },
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const { data, error } = await supabase
      .from('cart')
      .delete()
      .eq('session_id', sessionId)
      .eq('song_name', songName);

    if (error) throw error;

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://marinvladimir.com',
      },
      body: JSON.stringify({ message: 'Song removed from cart.' }),
    };
  } catch (error) {
    console.error('Error removing song from cart:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': 'https://marinvladimir.com',
      },
      body: JSON.stringify({ error: 'Failed to remove song from cart.' }),
    };
  }
};
