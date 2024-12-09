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
  const { sessionId, songName, songUrl, price } = JSON.parse(event.body);

  if (!sessionId || !songName || !songUrl || !price) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required fields' }),
    };
  }

  try {
    await pool.query(
      `INSERT INTO cart (session_id, song_name, song_url, price, last_accessed) 
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (session_id, song_name) 
       DO UPDATE SET last_accessed = NOW(), price = $4`,
      [sessionId, songName, songUrl, price]
    );

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Song added to cart.' }),
    };
  } catch (error) {
    console.error('Error updating cart:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to update cart.' }),
    };
  }
};
