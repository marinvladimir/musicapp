import React, { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferGeometry,
  DoubleSide,
  Float32BufferAttribute,
  MeshBasicMaterial,
} from "three";
import { useStore } from "../store";
import { bootLevel } from "../boot";
import { analysis } from "../audio/analysis";
import { drawLoudness, drawSpectrum } from "../audio/draw";
import { profile } from "../data/cv";
import {
  MONO,
  SANS,
  loadImage,
  roundRect,
  useCanvasTexture,
  whenFontsReady,
  wrapText,
} from "./textures";
import { albumTitle, coverUrl, formatSongName, formatTime } from "../utils";

const W = 1280;
const H = 720;
const SCREEN = { width: 3.6, height: 2.025, y: 1.85, z: -4.96 };
const PROJECTOR: [number, number, number] = [0, 3.0, -0.4];
// Keep animating for a moment after a pause so the bars settle down.
const DECAY_SECONDS = 2;

const drawIdle = (context: CanvasRenderingContext2D) => {
  const background = context.createLinearGradient(0, 0, W, H);
  background.addColorStop(0, "#14142a");
  background.addColorStop(1, "#24184a");
  context.fillStyle = background;
  context.fillRect(0, 0, W, H);

  context.textAlign = "center";
  context.fillStyle = "#4fd1c5";
  context.font = `500 26px ${MONO}`;
  context.fillText("HELLO, I'M", W / 2, 190);
  context.fillStyle = "#ffffff";
  context.font = `700 120px ${SANS}`;
  context.fillText(profile.name.toUpperCase(), W / 2, 310);
  context.fillStyle = "#a9a4ff";
  context.font = `500 46px ${SANS}`;
  context.fillText(profile.title, W / 2, 385);

  // Three headline facts from the CV, as pills.
  const facts = [
    "7+ years in production",
    "German federal gov. projects",
    "Mobile apps in both stores",
  ];
  context.font = `500 26px ${SANS}`;
  const gap = 24;
  const widths = facts.map((fact) => context.measureText(fact).width + 48);
  let x =
    (W -
      widths.reduce((sum, width) => sum + width, 0) -
      gap * (facts.length - 1)) /
    2;
  facts.forEach((fact, index) => {
    context.fillStyle = "rgba(108, 99, 255, 0.25)";
    roundRect(context, x, 445, widths[index], 56, 28);
    context.fill();
    context.fillStyle = "#e8e6ff";
    context.fillText(fact, x + widths[index] / 2, 482);
    x += widths[index] + gap;
  });

  context.fillStyle = "#8e8aad";
  context.font = `400 26px ${SANS}`;
  context.fillText(
    "CV on the desk  ·  projects on the TV  ·  music on the shelf",
    W / 2,
    620,
  );
  context.textAlign = "left";
};

// Artwork for songs that have no picture of their own yet.
const drawPlaceholderArt = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  title: string,
) => {
  const gradient = context.createLinearGradient(x, y, x + size, y + size);
  gradient.addColorStop(0, "#6c63ff");
  gradient.addColorStop(1, "#4fd1c5");
  context.fillStyle = gradient;
  context.fillRect(x, y, size, size);
  context.fillStyle = "rgba(255, 255, 255, 0.9)";
  context.font = `700 ${size * 0.45}px ${SANS}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("♪", x + size / 2, y + size * 0.42);
  context.font = `500 ${size * 0.06}px ${SANS}`;
  context.fillText(title, x + size / 2, y + size * 0.8, size * 0.85);
  context.textAlign = "left";
  context.textBaseline = "alphabetic";
};

const ART = { x: 70, y: 100, size: 520 };
const COLUMN = { x: 650, width: W - 650 - 70 };

const drawPlaying = (
  context: CanvasRenderingContext2D,
  {
    title,
    album,
    artwork,
    isPlaying,
    progress,
    time,
  }: {
    title: string;
    album: string;
    artwork: HTMLImageElement | null;
    isPlaying: boolean;
    progress: number;
    time: string;
  },
) => {
  context.fillStyle = "#101019";
  context.fillRect(0, 0, W, H);

  // A dim, oversized copy of the artwork tints the whole screen.
  if (artwork) {
    context.globalAlpha = 0.22;
    context.drawImage(artwork, -W * 0.1, -H * 0.6, W * 1.2, W * 1.2);
    context.globalAlpha = 1;
  }
  const shade = context.createLinearGradient(0, 0, W, 0);
  shade.addColorStop(0, "rgba(16, 16, 25, 0.35)");
  shade.addColorStop(0.5, "rgba(16, 16, 25, 0.85)");
  shade.addColorStop(1, "rgba(16, 16, 25, 0.95)");
  context.fillStyle = shade;
  context.fillRect(0, 0, W, H);

  // The artwork breathes with the loudness of the music.
  const grow = isPlaying ? analysis.level * 14 : 0;
  const size = ART.size + grow;
  const x = ART.x - grow / 2;
  const y = ART.y - grow / 2;
  context.save();
  context.shadowColor = "rgba(108, 99, 255, 0.8)";
  context.shadowBlur = 30 + analysis.level * 50;
  roundRect(context, x, y, size, size, 18);
  context.fillStyle = "#000";
  context.fill();
  context.restore();
  context.save();
  roundRect(context, x, y, size, size, 18);
  context.clip();
  if (artwork) context.drawImage(artwork, x, y, size, size);
  else drawPlaceholderArt(context, x, y, size, title);
  context.restore();

  context.fillStyle = "#4fd1c5";
  context.font = `500 24px ${MONO}`;
  context.fillText(isPlaying ? "▶ NOW PLAYING" : "❚❚ PAUSED", COLUMN.x, 130);
  context.fillStyle = "#ffffff";
  context.font = `700 52px ${SANS}`;
  const afterTitle = wrapText(
    context,
    title,
    COLUMN.x,
    196,
    COLUMN.width,
    58,
    2,
  );
  context.fillStyle = "#a9a4ff";
  context.font = `500 30px ${SANS}`;
  context.fillText(album, COLUMN.x, afterTitle + 4, COLUMN.width);

  context.fillStyle = "#8e8aad";
  context.font = `400 20px ${MONO}`;
  context.fillText("SPECTRUM", COLUMN.x, 330);
  drawSpectrum(context, analysis.bars, {
    x: COLUMN.x,
    y: 342,
    width: COLUMN.width,
    height: 150,
  });

  context.fillStyle = "#8e8aad";
  context.fillText("LOUDNESS", COLUMN.x, 530);
  context.textAlign = "right";
  context.fillStyle = "#4fd1c5";
  context.fillText(
    isFinite(analysis.db) && analysis.db > -50
      ? `${analysis.db.toFixed(1)} dB`
      : "– dB",
    COLUMN.x + COLUMN.width,
    530,
  );
  context.textAlign = "left";
  drawLoudness(context, analysis.history, {
    x: COLUMN.x,
    y: 542,
    width: COLUMN.width,
    height: 70,
  });

  context.fillStyle = "rgba(255, 255, 255, 0.12)";
  roundRect(context, COLUMN.x, 648, COLUMN.width, 8, 4);
  context.fill();
  context.fillStyle = "#6c63ff";
  roundRect(context, COLUMN.x, 648, Math.max(8, COLUMN.width * progress), 8, 4);
  context.fill();
  context.fillStyle = "#8e8aad";
  context.textAlign = "right";
  context.fillText(time, COLUMN.x + COLUMN.width, 690);
  context.textAlign = "left";
};

// Light beam from the projector to the corners of the screen.
const useBeamGeometry = () =>
  useMemo(() => {
    const [px, py, pz] = PROJECTOR;
    const halfW = SCREEN.width / 2;
    const halfH = SCREEN.height / 2;
    const corners = [
      [-halfW, SCREEN.y - halfH],
      [halfW, SCREEN.y - halfH],
      [halfW, SCREEN.y + halfH],
      [-halfW, SCREEN.y + halfH],
    ];
    const positions: number[] = [];
    corners.forEach(([x, y], index) => {
      const [nx, ny] = corners[(index + 1) % 4];
      positions.push(
        px,
        py,
        pz,
        x,
        y,
        SCREEN.z + 0.02,
        nx,
        ny,
        SCREEN.z + 0.02,
      );
    });
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    return geometry;
  }, []);

const Projection: React.FC = () => {
  const texture = useCanvasTexture(W, H, drawIdle);
  const beam = useBeamGeometry();
  const beamMaterial = useRef<MeshBasicMaterial>(null);
  const screen = useRef<MeshBasicMaterial>(null);
  const activeUntil = useRef(0);
  const showingIdle = useRef(true);
  const fontsLoaded = useRef(false);

  useEffect(() => {
    whenFontsReady().then(() => (fontsLoaded.current = true));
  }, []);

  const currentSong = useStore((state) => state.currentSong);
  const artwork = useRef<HTMLImageElement | null>(null);

  // Load the playing song's picture, falling back to its album cover and
  // then to a generated placeholder.
  useEffect(() => {
    artwork.current = null;
    if (!currentSong) return;
    let cancelled = false;
    const sources = [currentSong.imageUrl, coverUrl(currentSong.album)].filter(
      (url): url is string => !!url,
    );
    const tryNext = (index: number) => {
      if (index >= sources.length) return;
      loadImage(sources[index])
        .then((image) => {
          if (!cancelled) artwork.current = image;
        })
        .catch(() => tryNext(index + 1));
    };
    tryNext(0);
    return () => {
      cancelled = true;
    };
  }, [currentSong]);

  useFrame(({ clock }) => {
    const { currentSong, isPlaying, currentTime, duration } =
      useStore.getState();
    const now = clock.elapsedTime;
    screen.current?.color.setScalar(bootLevel(1.8, true));
    if (beamMaterial.current) {
      beamMaterial.current.opacity =
        (0.03 + (isPlaying ? analysis.level * 0.09 : 0)) * bootLevel(1.8);
    }
    const context = (texture.image as HTMLCanvasElement).getContext("2d");
    if (!context || !fontsLoaded.current) return;

    if (!currentSong) {
      if (!showingIdle.current) {
        drawIdle(context);
        texture.needsUpdate = true;
        showingIdle.current = true;
      }
      return;
    }
    if (isPlaying) activeUntil.current = now + DECAY_SECONDS;
    if (now > activeUntil.current && !showingIdle.current) return;

    showingIdle.current = false;
    drawPlaying(context, {
      title: formatSongName(currentSong.songName),
      album: albumTitle(currentSong.album),
      artwork: artwork.current,
      isPlaying,
      progress: duration > 0 ? currentTime / duration : 0,
      time: `${formatTime(currentTime)} / ${formatTime(duration)}`,
    });
    texture.needsUpdate = true;
  });

  return (
    <group>
      <mesh position={[0, SCREEN.y, SCREEN.z - 0.02]}>
        <boxGeometry args={[SCREEN.width + 0.12, SCREEN.height + 0.12, 0.02]} />
        <meshStandardMaterial color="#0d0d16" />
      </mesh>
      <mesh position={[0, SCREEN.y, SCREEN.z]}>
        <planeGeometry args={[SCREEN.width, SCREEN.height]} />
        <meshBasicMaterial ref={screen} map={texture} toneMapped={false} />
      </mesh>

      <mesh position={PROJECTOR}>
        <boxGeometry args={[0.36, 0.14, 0.3]} />
        <meshStandardMaterial color="#e8e6ff" roughness={0.4} />
      </mesh>
      <mesh position={[0, 3.12, -0.4]}>
        <cylinderGeometry args={[0.015, 0.015, 0.16, 8]} />
        <meshStandardMaterial color="#888" />
      </mesh>
      <mesh geometry={beam}>
        <meshBasicMaterial
          ref={beamMaterial}
          color="#a9a4ff"
          transparent
          opacity={0.03}
          blending={AdditiveBlending}
          depthWrite={false}
          side={DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
};

export default Projection;
