# Marin Vladimir · Interactive 3D CV

My CV as a small 3D room, live at [marin-cv.pages.dev](https://marin-cv.pages.dev).

- **Desk (centre):** my CV. Click the paper for the full version, which can also be printed or
  saved as a PDF. A phone on the desk opens the Elan Reformer Studio app on the TV.
- **TV (left):** the projects I built, one per channel, with static between channels and a
  teletext-style programme guide. Channels show a demo video, a screenshot or a test card.
- **Bookshelf (right):** my albums as books. Choosing a song flies the album's record to the
  turntable; the song's picture hangs above it, and the projection on the back wall shows the
  artwork, frequency spectrum and loudness live.
- **Walls:** a world map of the teams I have worked with, a career timeline, my diploma and
  animated code and network panels.

Visitors who just want the CV can skip the room from the first screen. The site is in English and
Croatian (EN / HR switch in the menu).

## Controls

By default the visitor moves between the three stations: click a glowing ring on the floor, an
object, the menu or the bar at the bottom, or use ← → (↓ shows the whole room). Dragging looks
around a little. **Free roam** in the menu unlocks walking anywhere with WASD / arrow keys (or
on-screen arrows on touch screens), **Pixel** switches to a pixel-art look and **Sounds** turns
the room's ambience and sound effects on or off.

## Tech stack

React 18, TypeScript and Vite, with [React Three Fiber](https://r3f.docs.pmnd.rs/) (three.js)
and postprocessing (bloom, vignette, pixelation) for the room, zustand for shared state,
styled-components for the panels and the Web Audio API for the music analysis and the generated
sound effects. Most of the room is built from simple shapes, with text, screens and the CV drawn
on canvases; some furniture comes from [Meshy](https://www.meshy.ai/) models.

## Project structure

```
src/
  data/          CV content in English (cv.ts) and Croatian (cv.hr.ts), tech logos, world map
  scene/         the 3D room: layout, furniture, models, camera, projection, TV, walls
  ui/            loading screen, intro, HUD and the CV, TV and music panels
  audio/         music player, record transfer, analysis, visualisation and sound effects
  i18n.ts        interface texts in both languages
public/assets/
  music/         albums with preview MP3s, artwork and metadata.json
  covers/        small album covers used on the bookshelf
  models/        optimised Meshy models (GLB, meshopt, 512 px WebP textures)
  demos/         trailer and screenshots shown on the TV
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

## Deploying

The site is on Cloudflare Pages, which builds every push to `main`. Any static host works: use
the build command `npm run build` and the output directory `dist` (`netlify.toml` sets this for
Netlify). Node.js 22 is pinned in `.node-version`.

## Updating content

- **CV and projects:** edit `src/data/cv.ts` and its Croatian copy `src/data/cv.hr.ts`. A project
  can have a `demo` video and an `image` (screenshot) for its TV channel, a `url` for the "Visit"
  link, and `onTv: false` to keep it in the CV but off the TV. Put videos and screenshots in
  `public/assets/demos/`; compress videos first, for example with
  `ffmpeg -i in.mp4 -vf scale=540:-2 -an -c:v libx264 -crf 30 -movflags +faststart out.mp4`.
- **Tech stack logos:** `src/data/tech.ts` (logos from Simple Icons).
- **New album:** add a folder to `public/assets/music/` with the preview MP3s, a `.png` per song and
  an `Album_Cover.png`, then run `python3 scripts/generateCovers.py` (needs Pillow) and
  `npm run generate-metadata`.
- **3D models:** do not commit original model files. Optimise a copy first, for example with
  `npx @gltf-transform/cli optimize in.glb public/assets/models/name.glb --texture-compress webp
  --texture-size 512 --compress meshopt`, and place it with the `Model` component
  (`src/scene/Model.tsx`).

## Previous version

The earlier music web shop (Stripe checkout, Supabase cart, Dropbox downloads) is the git history
up to commit `7e84d4e`. To tag it: `git tag v1-shop 7e84d4e && git push origin v1-shop`.
