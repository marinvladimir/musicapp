import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import pkg from 'pg';
import cron from "node-cron";
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

cron.schedule("0 0 * * *", async () => {
  try {
    await pool.query(
      `DELETE FROM cart WHERE last_accessed < NOW() - INTERVAL '30 days'`
    );
    console.log("Cleaned up expired cart data.");
  } catch (error) {
    console.error("Error cleaning up expired cart data:", error);
  }
});

const initializeDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cart (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        song_name VARCHAR(255) NOT NULL,
        song_url VARCHAR(255) NOT NULL,
        last_accessed TIMESTAMP NOT NULL,
        CONSTRAINT unique_session_song UNIQUE (session_id, song_name)
      );
    `);
    console.log("Database initialized successfully.");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:8888",
    "https://musicmarna.netlify.app" 
  ],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, "assets")));

const PORT = 5000;
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await initializeDatabase();
});
