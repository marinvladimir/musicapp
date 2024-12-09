const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

exports.handler = async (event, context) => {
  const { sessionId, songName } = JSON.parse(event.body); 

  if (!sessionId || !songName) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required fields' }),
    };
  }

  try {
    const { data, error } = await supabase
      .from('cart')
      .delete()
      .eq('session_id', sessionId)
      .eq('song_name', songName);

    if (error) {
      throw error;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Song removed from cart.' }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    };
  } catch (error) {
    console.error('Error removing song from cart:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to remove song from cart.' }),
    };
  }
};
