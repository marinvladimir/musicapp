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
import { analysis } from "../audio/analysis";
import { drawLoudness, drawSpectrum } from "../audio/draw";
import { profile } from "../data/cv";
import { MONO, SANS, useCanvasTexture, whenFontsReady } from "./textures";
import { albumTitle, formatSongName } from "../utils";

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
  context.fillStyle = "#ffffff";
  context.font = `700 120px ${SANS}`;
  context.fillText(profile.name.toUpperCase(), W / 2, 300);
  context.fillStyle = "#a9a4ff";
  context.font = `500 48px ${SANS}`;
  context.fillText(profile.title, W / 2, 380);
  context.fillStyle = "#4fd1c5";
  context.font = `400 30px ${MONO}`;
  context.fillText(profile.stack, W / 2, 450);
  context.fillStyle = "#8e8aad";
  context.font = `400 28px ${SANS}`;
  context.fillText(
    "Walk around · CV on the desk · projects on the left · music on the right",
    W / 2,
    600,
  );
  context.textAlign = "left";
};

const drawPlaying = (
  context: CanvasRenderingContext2D,
  title: string,
  album: string,
) => {
  context.fillStyle = "#12121f";
  context.fillRect(0, 0, W, H);

  context.fillStyle = "#ffffff";
  context.font = `700 54px ${SANS}`;
  context.fillText(title, 70, 100, W - 400);
  context.fillStyle = "#a9a4ff";
  context.font = `500 32px ${SANS}`;
  context.fillText(album, 70, 148);

  context.textAlign = "right";
  context.fillStyle = "#4fd1c5";
  context.font = `400 34px ${MONO}`;
  const db =
    isFinite(analysis.db) && analysis.db > -50
      ? `${analysis.db.toFixed(1)} dB`
      : "– dB";
  context.fillText(db, W - 70, 100);
  context.fillStyle = "#8e8aad";
  context.font = `400 24px ${SANS}`;
  context.fillText("LOUDNESS", W - 70, 140);
  context.textAlign = "left";

  context.fillStyle = "#8e8aad";
  context.font = `400 24px ${SANS}`;
  context.fillText("SPECTRUM  40 Hz – 16 kHz", 70, 220);
  drawSpectrum(context, analysis.bars, {
    x: 70,
    y: 235,
    width: W - 140,
    height: 220,
  });
  context.fillText("LOUDNESS  last 5 s", 70, 500);
  drawLoudness(context, analysis.history, {
    x: 70,
    y: 515,
    width: W - 140,
    height: 160,
  });
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
  const activeUntil = useRef(0);
  const showingIdle = useRef(true);
  const fontsLoaded = useRef(false);

  useEffect(() => {
    whenFontsReady().then(() => (fontsLoaded.current = true));
  }, []);

  useFrame(({ clock }) => {
    const { currentSong, isPlaying } = useStore.getState();
    const now = clock.elapsedTime;
    if (beamMaterial.current) {
      beamMaterial.current.opacity =
        0.03 + (isPlaying ? analysis.level * 0.09 : 0);
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
    drawPlaying(
      context,
      formatSongName(currentSong.songName),
      albumTitle(currentSong.album),
    );
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
        <meshBasicMaterial map={texture} toneMapped={false} />
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
