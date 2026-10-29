# Marin Vladimir · Interactive 3D CV

My CV as a small 3D room you can walk around, live at [marinvladimir.com](https://marinvladimir.com).

- **Desk (centre):** my CV. Click the paper for the full version, which can also be printed or saved as a PDF.
- **Computer (left):** my own products and client work.
- **Bookshelf (right):** my albums as books. Take one out and play it on the turntable; the
  projection on the back wall shows the music's frequency spectrum and loudness live.

Visitors who just want the CV can skip the room from the first screen.

## Controls

| Action      | Desktop                        | Touch            |
| ----------- | ------------------------------ | ---------------- |
| Look around | Drag                           | Drag             |
| Walk        | WASD / arrow keys (Shift runs) | On-screen arrows |
| Open things | Click objects or the top menu  | Tap              |

## Tech stack

React 18, TypeScript and Vite, with [React Three Fiber](https://r3f.docs.pmnd.rs/) (three.js)
for the room, zustand for shared state, styled-components for the panels and the Web Audio API
for the visualisation. Everything in the room is built from simple shapes, and text, the CV and
screens are drawn on canvases, so there are no 3D model files to download.

## Project structure

```
src/
  data/cv.ts     all CV content (experience, projects, skills)
  scene/         the 3D room: layout, furniture, camera controls, projection
  ui/            HUD, intro screen and the CV, projects and music panels
  audio/         audio player, analysis and drawing of the visualisation
public/assets/
  music/         albums with preview MP3s, artwork and metadata.json
  covers/        small album covers used on the bookshelf
```

## Running locally

```bash
npm install
npm run dev
```

| Command          | Description                                   |
| ---------------- | --------------------------------------------- |
| `npm run dev`    | Start the dev server                          |
| `npm run build`  | Type-check, generate music metadata and build |
| `npm run lint`   | Run ESLint                                    |
| `npm run format` | Format the source with Prettier               |

## Updating content

- **CV:** edit `src/data/cv.ts`.
- **New album:** add a folder to `public/assets/music/` with the preview MP3s, a `.png` per song and
  an `Album_Cover.png`, then run `python3 scripts/generateCovers.py` (needs Pillow) and
  `npm run generate-metadata`.

## Previous version

The earlier music web shop (Stripe checkout, Supabase cart, Dropbox downloads) is kept in git
under the tag `v1-shop`.
