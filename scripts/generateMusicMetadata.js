import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const generateMusicMetadata = () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const musicDir = path.join(__dirname, '../public/assets/music');
  const pricesPath = path.join(musicDir, 'prices.json');
  
  if (!fs.existsSync(pricesPath)) {
    throw new Error('prices.json not found in music directory.');
  }

  const prices = JSON.parse(fs.readFileSync(pricesPath));

  const albums = fs.readdirSync(musicDir).reduce((result, album) => {
    const albumPath = path.join(musicDir, album);
    if (fs.statSync(albumPath).isDirectory()) {
      const files = fs.readdirSync(albumPath);
      const mp3Files = files.filter((file) => file.endsWith('.mp3'));
      const imageFiles = files.filter((file) => file.match(/\.(jpg|jpeg|png)$/i));

      const albumPrices = prices[album] || {};

      const songs = mp3Files.map((song) => {
        const image = imageFiles.find((img) => img.startsWith(song.replace('.mp3', '')));
        return {
          songName: song,
          songUrl: `/assets/music/${album}/${song}`,
          imageUrl: image ? `/assets/music/${album}/${image}` : null,
          price: albumPrices[song] || 1.99,
        };
      });

      result.push({ albumName: album, songs });
    }
    return result;
  }, []);

  const outputPath = path.join(musicDir, 'metadata.json');
  fs.writeFileSync(outputPath, JSON.stringify(albums, null, 2));
  console.log(`Metadata generated successfully at ${outputPath}`);
};

generateMusicMetadata();
