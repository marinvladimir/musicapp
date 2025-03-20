const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://marinvladimir.com', 
        'Access-Control-Allow-Methods': 'GET, OPTIONS', 
        'Access-Control-Allow-Headers': 'Content-Type', 
      },
      body: '',
    };
  }

  const { sessionId } = event.queryStringParameters;

  if (!sessionId) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': 'https://marinvladimir.com',
      },
      body: JSON.stringify({ error: 'sessionId is required' }),
    };
  }

  await supabase.rpc('create_cart_table');

  try {
    const { data, error } = await supabase
      .from('cart')
      .select('*')
      .eq('session_id', sessionId);

    if (error) {
      throw error;
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://marinvladimir.com', 
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Error fetching cart:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': 'https://marinvladimir.com',
      },
      body: JSON.stringify({ error: 'Failed to fetch cart.' }),
    };
  }
};
