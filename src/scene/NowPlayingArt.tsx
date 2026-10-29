import React, { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CanvasTexture, MeshBasicMaterial, SRGBColorSpace } from "three";
import { useStore } from "../store";
import { analysis } from "../audio/analysis";
import { isRecordOnPlatter } from "../audio/recordTransfer";
import { albumTitle, coverUrl, formatSongName } from "../utils";
import { MONO, SANS, loadImage, whenFontsReady, wrapText } from "./textures";
import { neon } from "./neon";

const SIZE = 768;
const FADE_SECONDS = 0.9;

const drawIdle = (context: CanvasRenderingContext2D) => {
  const background = context.createLinearGradient(0, 0, SIZE, SIZE);
  background.addColorStop(0, "#15152c");
  background.addColorStop(1, "#2b1d5c");
  context.fillStyle = background;
  context.fillRect(0, 0, SIZE, SIZE);
  context.textAlign = "center";
  context.fillStyle = "#4fd1c5";
  context.font = `500 30px ${MONO}`;
  context.fillText("NOW PLAYING", SIZE / 2, 250);
  context.fillStyle = "rgba(255, 255, 255, 0.85)";
  context.font = `700 200px ${SANS}`;
  context.fillText("♪", SIZE / 2, 470);
  context.fillStyle = "#a9a4ff";
  context.font = `500 38px ${SANS}`;
  context.fillText("Pick a record from the shelf", SIZE / 2, 580);
  context.textAlign = "left";
};

const drawSong = (
  context: CanvasRenderingContext2D,
  image: HTMLImageElement | null,
  title: string,
  album: string,
) => {
  if (image) {
    context.drawImage(image, 0, 0, SIZE, SIZE);
  } else {
    const placeholder = context.createLinearGradient(0, 0, SIZE, SIZE);
    placeholder.addColorStop(0, "#6c63ff");
    placeholder.addColorStop(1, "#4fd1c5");
    context.fillStyle = placeholder;
    context.fillRect(0, 0, SIZE, SIZE);
  }
  const shade = context.createLinearGradient(0, SIZE * 0.55, 0, SIZE);
  shade.addColorStop(0, "rgba(10, 10, 20, 0)");
  shade.addColorStop(1, "rgba(10, 10, 20, 0.9)");
  context.fillStyle = shade;
  context.fillRect(0, SIZE * 0.55, SIZE, SIZE * 0.45);

  context.fillStyle = "#4fd1c5";
  context.font = `500 26px ${MONO}`;
  context.fillText("▶ NOW PLAYING", 40, SIZE - 170);
  context.fillStyle = "#ffffff";
  context.font = `700 52px ${SANS}`;
  const after = wrapText(context, title, 40, SIZE - 110, SIZE - 80, 56, 1);
  context.fillStyle = "#c9c5ff";
  context.font = `500 30px ${SANS}`;
  context.fillText(album, 40, after - 6, SIZE - 80);
};

// Big picture of the playing song on the wall above the turntable, so it is
// in view from the music station.
const NowPlayingArt: React.FC = () => {
  const currentSong = useStore((state) => state.currentSong);
  const material = useRef<MeshBasicMaterial>(null);
  const frame = useRef<MeshBasicMaterial>(null);
  const brightness = useRef(0.6);

  // The wall shows `shown`; a new picture is drawn into `next` and faded in
  // over the old one (kept in `previous`) instead of replacing it at once.
  const canvases = useMemo(() => {
    const make = () => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = SIZE;
      return canvas;
    };
    return { shown: make(), previous: make(), next: make() };
  }, []);
  const texture = useMemo(() => {
    const result = new CanvasTexture(canvases.shown);
    result.colorSpace = SRGBColorSpace;
    return result;
  }, [canvases]);
  const fade = useRef<{ startedAt: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const prepare = async () => {
      await whenFontsReady();
      const context = canvases.next.getContext("2d")!;
      if (!currentSong) {
        drawIdle(context);
      } else {
        let image: HTMLImageElement | null = null;
        for (const source of [
          currentSong.imageUrl,
          coverUrl(currentSong.album),
        ]) {
          if (!source) continue;
          try {
            image = await loadImage(source);
            break;
          } catch {
            // Try the next picture.
          }
        }
        drawSong(
          context,
          image,
          formatSongName(currentSong.songName),
          albumTitle(currentSong.album),
        );
      }
      if (cancelled) return;
      canvases.previous.getContext("2d")!.drawImage(canvases.shown, 0, 0);
      fade.current = { startedAt: performance.now() };
    };
    prepare();
    return () => {
      cancelled = true;
    };
  }, [currentSong, canvases]);

  useEffect(() => () => texture.dispose(), [texture]);

  // Dim while the record is on its way, full brightness once it plays.
  useFrame((_, delta) => {
    if (fade.current) {
      const t = Math.min(
        1,
        (performance.now() - fade.current.startedAt) / (FADE_SECONDS * 1000),
      );
      const eased = t * t * (3 - 2 * t);
      const context = canvases.shown.getContext("2d")!;
      context.globalAlpha = 1;
      context.drawImage(canvases.previous, 0, 0);
      // The new picture fades in while settling from a slight zoom.
      const zoom = 1 + (1 - eased) * 0.06;
      const offset = (SIZE * (zoom - 1)) / 2;
      context.globalAlpha = eased;
      context.drawImage(
        canvases.next,
        -offset,
        -offset,
        SIZE * zoom,
        SIZE * zoom,
      );
      context.globalAlpha = 1;
      texture.needsUpdate = true;
      if (t >= 1) fade.current = null;
    }

    const { isPlaying } = useStore.getState();
    const target = !currentSong
      ? 0.6
      : !isRecordOnPlatter()
        ? 0.3
        : isPlaying
          ? 1
          : 0.65;
    brightness.current +=
      (target - brightness.current) * Math.min(1, delta * 3);
    material.current?.color.setScalar(brightness.current);
    frame.current?.color.copy(neon("#b56cff", 1.2 + analysis.level * 2.5));
  });

  return (
    <group position={[5.96, 2.12, 1.4]} rotation-y={-Math.PI / 2}>
      <mesh position={[0, 0, -0.012]}>
        <boxGeometry args={[1.46, 1.46, 0.02]} />
        <meshStandardMaterial color="#0d0d16" />
      </mesh>
      <mesh position={[0, 0, -0.001]}>
        <planeGeometry args={[1.42, 1.42]} />
        <meshBasicMaterial ref={frame} toneMapped={false} />
      </mesh>
      <mesh>
        <planeGeometry args={[1.38, 1.38]} />
        <meshBasicMaterial ref={material} map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
};

export default NowPlayingArt;
