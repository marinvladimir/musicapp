const { Pool } = require('pg');
require('dotenv').config(); 

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

exports.handler = async (event, context) => {
  const { sessionId } = event.queryStringParameters;

  if (!sessionId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'sessionId is required' }),
    };
  }

  try {
    const result = await pool.query('SELECT * FROM cart WHERE session_id = $1', [sessionId]);

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    };
  } catch (error) {
    console.error('Error fetching cart:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch cart.' }),
    };
  }
};
