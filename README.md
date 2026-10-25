# Marna's Music

A small online store for my own instrumental music, live at [marinvladimir.com](https://marinvladimir.com).
Visitors can browse albums, listen to short previews, add songs to a cart, pay with Stripe and
download the full tracks right after checkout.

## Features

- Album browser and music player with playlist, seek bar and track artwork
- Persistent cart, stored in Supabase per browser session
- Stripe Checkout payments, with prices computed on the server
- Download links to the full tracks (Dropbox), released only after Stripe confirms the payment
- Contact form via EmailJS
- Responsive layout built with styled-components

## Tech stack

| Layer    | Tools                                                           |
| -------- | --------------------------------------------------------------- |
| Frontend | React 18, TypeScript, Vite, React Router, styled-components     |
| Backend  | Netlify Functions (Node.js)                                     |
| Services | Stripe (payments), Supabase (cart), Dropbox (files), EmailJS    |

## How a purchase works

1. The site loads the album catalogue (`/.netlify/functions/albums`), which is generated at build
   time from `public/assets/music/` into `metadata.json`.
2. Songs added to the cart are saved in Supabase under a random session ID kept in `localStorage`.
3. `createCheckout` looks up each song's price in the server-side catalogue and creates a Stripe
   Checkout session. The browser only sends song names, so prices cannot be changed by the client.
4. After payment, Stripe redirects to `/#/success`. `getDownloadLink` checks with Stripe that the
   session is paid and returns Dropbox download links for the purchased songs.
5. The cart is emptied, and a scheduled function (`cleanupCart`) removes carts unused for 30 days.

The MP3 files in `public/assets/music/` are short previews; the full-length tracks live in Dropbox.

## Project structure

```
netlify/functions/   serverless API (cart, checkout, payment check, download links)
public/assets/music/ album folders with preview MP3s, artwork and prices.json
scripts/             build script that generates metadata.json from the music folders
src/
  components/        header, music player, cart, checkout, carousel
  pages/             home, music, about, contact, checkout, success, cancel
  states/            cart context
```

## Running locally

Requires Node.js 18+ and the [Netlify CLI](https://docs.netlify.com/cli/get-started/) to run the functions.

```bash
npm install
cp .env.example .env   # fill in your own keys
netlify dev            # frontend and functions together
```

`npm run dev` starts only the Vite frontend.

### Environment variables

See [`.env.example`](.env.example). Secrets (`STRIPE_SECRET_KEY`, Dropbox and Supabase keys) are used only
by the Netlify functions and must not use the `VITE_` prefix, because Vite exposes every `VITE_*`
variable to the browser.

## Scripts

| Command                     | Description                                       |
| --------------------------- | ------------------------------------------------- |
| `npm run dev`               | Start the Vite dev server                         |
| `npm run build`             | Type-check, generate music metadata, build        |
| `npm run lint`              | Run ESLint                                        |
| `npm run format`            | Format the source with Prettier                   |
| `npm run generate-metadata` | Regenerate `public/assets/music/metadata.json`    |

## Adding music

1. Create a folder in `public/assets/music/` named after the album (use `_` instead of spaces).
2. Add the preview MP3s and a `.png` with the same name as each song for its artwork.
3. Set prices in `public/assets/music/prices.json` (songs without a price default to €1.99).
4. Create a Stripe product with the exact song file name and upload the full track to Dropbox under the same name.
5. Run `npm run generate-metadata` (also runs automatically on build).
