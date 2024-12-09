import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pkg from 'pg';
import cron from "node-cron";
import router from './router.js';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const MUSIC_FOLDER = path.join(__dirname, "assets/music");

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
    "https://musicmarna.netlify.app" 
  ],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, "assets")));

app.use(router);

app.get("/api/albums", (req, res) => {
  try {
    const pricesPath = path.join(__dirname, 'assets/music/prices.json');
    const prices = JSON.parse(fs.readFileSync(pricesPath, 'utf8'));

    const albums = fs.readdirSync(MUSIC_FOLDER).reduce((result, album) => {
      const albumPath = path.join(MUSIC_FOLDER, album);
      if (fs.statSync(albumPath).isDirectory()) {
        const files = fs.readdirSync(albumPath);
        const mp3Files = files.filter((file) => file.endsWith(".mp3"));
        const imageFiles = files.filter((file) => file.match(/\.(jpg|jpeg|png)$/i));

        const albumPrices = prices[album] || {};

        const songs = mp3Files.map((song) => {
          const image = imageFiles.find((img) => img.startsWith(song.replace(".mp3", "")));
          return {
            songName: song,
            songUrl: `https://musicmarna.netlify.app/assets/music/demos/${album}/${song}`,
            imageUrl: image ? `/assets/music/${album}/${image}` : null,
            price: albumPrices[song] || 1.99, 
          };
        });

        result.push({ albumName: album, songs });
      }
      return result;
    }, []);
    res.json(albums);
  } catch (error) {
    console.error("Error reading albums:", error);
    res.status(500).send("Error fetching album data.");
  }
});


app.post("/api/cart", async (req, res) => {
  const { sessionId, songName, songUrl, price } = req.body;
  try {
    await pool.query(
      `INSERT INTO cart (session_id, song_name, song_url, price, last_accessed) 
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (session_id, song_name) 
       DO UPDATE SET last_accessed = NOW(), price = $4`,
      [sessionId, songName, songUrl, price]
    );
    res.status(201).json({ message: "Song added to cart." });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ error: "Failed to update cart." });
  }
});

app.get("/api/cart", async (req, res) => {
  const { sessionId } = req.query;
  try {
    const result = await pool.query(
      "SELECT * FROM cart WHERE session_id = $1",
      [sessionId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ error: "Failed to fetch cart." });
  }
});

app.delete("/api/cart", async (req, res) => {
  const { sessionId, songName } = req.body;
  try {
    const result = await pool.query(
      "DELETE FROM cart WHERE session_id = $1 AND song_name = $2",
      [sessionId, songName]
    );
    res.json({ message: "Song removed from cart." });
  } catch (error) {
    console.error("Error removing song from cart:", error);
    res.status(500).json({ error: "Failed to remove song from cart." });
  }
});

const PORT = 5000;
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await initializeDatabase();
});
