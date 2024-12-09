const fetch = require('node-fetch'); 

const MUSIC_URL_BASE = 'https://musicmarna.netlify.app/assets/music';

exports.handler = async (event, context) => {
  try {
    // Fetch prices data
    const response = await fetch('https://musicmarna.netlify.app/assets/music/prices.json');
    const prices = await response.json(); 

    const albumNames = ['Echoes_Of_Distant_Melodies', 'Lights_Of_Inspiration', 'The_Everlasting_Blue'];

    const albums = albumNames.reduce((result, album) => {
      const albumPrices = prices[album] || {};  // Prices for the specific album
      const albumBaseUrl = `${MUSIC_URL_BASE}/${album}`; // URL base for this album

      const songs = [
        "Dance_In_The_Park.mp3", "Emotional_Mixture.mp3", "Eternal_Chords.mp3", 
        "Forest_Festival.mp3", "Friendly_Crowd_Ballad.mp3", "Snowfall_In_Town_Center.mp3", 
        "Town_Square.mp3", "Winter_Atmosphere.mp3"
      ];

      const songData = songs.map((song) => {
        const songPrice = albumPrices[song] || 1.99; 

        return {
          songName: song,
          songUrl: `${albumBaseUrl}/${song}`, 
          imageUrl: `${albumBaseUrl}/${song.replace('.mp3', '.jpg')}`,  
          price: songPrice
        };
      });

      result.push({
        albumName: album,
        songs: songData
      });

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
