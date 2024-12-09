const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  try {
    const pricesPath = path.join(__dirname, '../assets/music/prices.json');
    const prices = JSON.parse(fs.readFileSync(pricesPath, 'utf8'));

    const albums = fs.readdirSync(path.join(__dirname, '../assets/music')).reduce((result, album) => {
      const albumPath = path.join(__dirname, '../assets/music', album);
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
    
    return {
      statusCode: 200,
      body: JSON.stringify(albums),
    };
  } catch (error) {
    console.error("Error reading albums:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error fetching album data." }),
    };
  }
};
