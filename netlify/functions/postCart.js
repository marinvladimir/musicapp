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

  const { sessionId, songName, songUrl, price } = JSON.parse(event.body);

  if (!sessionId || !songName || !songUrl || !price) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': 'https://marinvladimir.com', 
      },
      body: JSON.stringify({ error: 'Missing required fields' }),
    };
  }

  try {
    const { data, error } = await supabase
      .from('cart')
      .upsert(
        [
          {
            session_id: sessionId,
            song_name: songName,
            song_url: songUrl,
            price: price,
            last_accessed: new Date().toISOString(),
          },
        ],
        { onConflict: ['session_id', 'song_name'] }
      );

    if (error) {
      throw error;
    }

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': 'https://marinvladimir.com', 
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ message: 'Song added to cart.' }),
    };
  } catch (error) {
    console.error('Error updating cart:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': 'https://marinvladimir.com', 
      },
      body: JSON.stringify({ error: 'Failed to update cart.' }),
    };
  }
};
