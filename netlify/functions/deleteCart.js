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
  const { sessionId, songName } = JSON.parse(event.body); 

  if (!sessionId || !songName) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required fields' }),
    };
  }

  try {
    await pool.query(
      'DELETE FROM cart WHERE session_id = $1 AND song_name = $2',
      [sessionId, songName]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Song removed from cart.' }),
    };
  } catch (error) {
    console.error('Error removing song from cart:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to remove song from cart.' }),
    };
  }
};
