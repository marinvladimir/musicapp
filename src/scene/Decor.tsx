import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Points,
} from "three";
import Sign from "./Sign";
import Model from "./Model";
import { profile } from "../data/cv";
import { neon } from "./neon";
import { MONO, SANS, roundRect, useCanvasTexture, wrapText } from "./textures";

// Night view of Split: sky, stars, the hills and lights along the sea.
const drawWindow = (context: CanvasRenderingContext2D) => {
  const width = 640;
  const height = 480;
  const sky = context.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, "#0b0b2b");
  sky.addColorStop(0.6, "#2b1d5c");
  sky.addColorStop(1, "#4a2a6b");
  context.fillStyle = sky;
  context.fillRect(0, 0, width, height);

  for (let i = 0; i < 140; i++) {
    context.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.7})`;
    context.fillRect(Math.random() * width, Math.random() * height * 0.6, 2, 2);
  }
  context.fillStyle = "#f3efff";
  context.beginPath();
  context.arc(480, 110, 38, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#1d1640";
  context.beginPath();
  context.arc(496, 100, 34, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#151030";
  context.beginPath();
  context.moveTo(0, 330);
  for (let x = 0; x <= width; x += 40)
    context.lineTo(x, 300 + Math.sin(x * 0.012) * 40);
  context.lineTo(width, height);
  context.lineTo(0, height);
  context.fill();

  context.fillStyle = "#0d0a22";
  for (let x = 0; x < width; x += 26) {
    const buildingHeight = 30 + Math.random() * 60;
    context.fillRect(x, 380 - buildingHeight, 22, buildingHeight + 20);
    for (let y = 380 - buildingHeight + 6; y < 390; y += 12) {
      if (Math.random() > 0.55) {
        context.fillStyle = Math.random() > 0.5 ? "#ffd59a" : "#a9c8ff";
        context.fillRect(x + 4 + Math.random() * 12, y, 4, 5);
        context.fillStyle = "#0d0a22";
      }
    }
  }
  const sea = context.createLinearGradient(0, 400, 0, height);
  sea.addColorStop(0, "#1b1446");
  sea.addColorStop(1, "#0b0b22");
  context.fillStyle = sea;
  context.fillRect(0, 400, width, height - 400);
  for (let i = 0; i < 40; i++) {
    context.fillStyle = "rgba(255, 213, 154, 0.35)";
    context.fillRect(
      Math.random() * width,
      405 + Math.random() * 70,
      10 + Math.random() * 20,
      2,
    );
  }
};

const Window: React.FC = () => {
  const view = useCanvasTexture(640, 480, drawWindow);
  return (
    // On the left wall, near the entrance.
    <group position={[-5.98, 1.75, 2.8]} rotation-y={Math.PI / 2}>
      <mesh>
        <planeGeometry args={[1.8, 1.35]} />
        <meshBasicMaterial map={view} toneMapped={false} />
      </mesh>
      {[
        [0, 0.7, 1.9, 0.06],
        [0, -0.7, 1.9, 0.06],
        [-0.93, 0, 0.06, 1.46],
        [0.93, 0, 0.06, 1.46],
        [0, 0, 0.04, 1.4],
        [0, 0, 1.86, 0.04],
      ].map(([x, y, w, h], index) => (
        <mesh key={index} position={[x, y, 0.02]}>
          <boxGeometry args={[w, h, 0.05]} />
          <meshStandardMaterial color="#e8e6ff" roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, -0.74, 0.08]}>
        <boxGeometry args={[2, 0.05, 0.18]} />
        <meshStandardMaterial color="#e8e6ff" roughness={0.5} />
      </mesh>
      <pointLight
        position={[0, 0, 0.6]}
        intensity={2}
        distance={3}
        color="#8f88ff"
      />
    </group>
  );
};

// Framed poster for one of my games.
const Poster: React.FC<{
  position: [number, number, number];
  rotationY: number;
  title: string;
  tagline: string;
  colors: [string, string];
}> = ({ position, rotationY, title, tagline, colors }) => {
  const art = useCanvasTexture(
    420,
    600,
    (context) => {
      const gradient = context.createLinearGradient(0, 0, 420, 600);
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(1, colors[1]);
      context.fillStyle = gradient;
      context.fillRect(0, 0, 420, 600);
      // Simple geometric artwork.
      context.fillStyle = "rgba(255, 255, 255, 0.15)";
      for (let i = 0; i < 6; i++) {
        context.beginPath();
        context.arc(210, 230, 40 + i * 28, 0, Math.PI * 2);
        context.lineWidth = 6;
        context.strokeStyle = `rgba(255, 255, 255, ${0.25 - i * 0.035})`;
        context.stroke();
      }
      context.fillStyle = "rgba(255, 255, 255, 0.9)";
      roundRect(context, 170, 190, 80, 80, 18);
      context.fill();
      context.fillStyle = "#ffffff";
      context.font = `700 46px ${SANS}`;
      context.textAlign = "center";
      wrapText(context, title.toUpperCase(), 210, 440, 380, 50, 2);
      context.font = `500 20px ${MONO}`;
      context.fillStyle = "rgba(255, 255, 255, 0.85)";
      context.fillText(tagline, 210, 560, 380);
    },
    [title, tagline],
  );
  return (
    <group position={position} rotation-y={rotationY}>
      <mesh position={[0, 0, -0.01]}>
        <boxGeometry args={[0.68, 0.94, 0.03]} />
        <meshStandardMaterial color="#14141f" />
      </mesh>
      <mesh position={[0, 0, 0.007]}>
        <planeGeometry args={[0.6, 0.86]} />
        <meshStandardMaterial map={art} roughness={0.6} />
      </mesh>
    </group>
  );
};

// My degree, framed on the wall next to the TV.
const Diploma: React.FC = () => {
  const paper = useCanvasTexture(600, 440, (context) => {
    context.fillStyle = "#f6f1e4";
    context.fillRect(0, 0, 600, 440);
    context.strokeStyle = "#b89b5e";
    context.lineWidth = 6;
    context.strokeRect(18, 18, 564, 404);
    context.lineWidth = 1.5;
    context.strokeRect(30, 30, 540, 380);
    context.textAlign = "center";
    context.fillStyle = "#6b5a33";
    context.font = `500 18px ${MONO}`;
    context.fillText("UNIVERSITY OF SPLIT · FESB", 300, 90);
    context.fillStyle = "#2a2440";
    context.font = `700 40px ${SANS}`;
    context.fillText("Master of Science", 300, 165);
    context.font = `500 22px ${SANS}`;
    context.fillText("Information and Communication Technology", 300, 205);
    context.fillStyle = "#6b5a33";
    context.font = `400 18px ${SANS}`;
    context.fillText("awarded to", 300, 255);
    context.fillStyle = "#2a2440";
    context.font = `700 34px ${SANS}`;
    context.fillText(profile.name, 300, 300);
    context.fillStyle = "#6b5a33";
    context.font = `500 20px ${MONO}`;
    context.fillText("2019", 300, 370);
    // Gold seal.
    context.fillStyle = "#c9a54a";
    context.beginPath();
    context.arc(500, 350, 32, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#f6f1e4";
    context.font = `700 16px ${SANS}`;
    context.fillText("M.Sc.", 500, 356);
  });
  return (
    <group position={[-5.98, 1.75, 0.95]} rotation-y={Math.PI / 2}>
      <mesh position={[0, 0, -0.01]}>
        <boxGeometry args={[0.74, 0.56, 0.035]} />
        <meshStandardMaterial color="#2a2018" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.009]}>
        <planeGeometry args={[0.64, 0.47]} />
        <meshStandardMaterial map={paper} roughness={0.7} />
      </mesh>
    </group>
  );
};

// Slowly drifting dust, catching the light of the projector and spotlights.
const Dust: React.FC = () => {
  const points = useRef<Points>(null);
  const sprite = useCanvasTexture(32, 32, (context) => {
    const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 32, 32);
  });
  const geometry = useMemo(() => {
    const count = 260;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = Math.random() * 3;
      // Mostly in the back half of the room, away from the camera's start.
      positions[i * 3 + 2] = -4.5 + Math.random() * 7;
    }
    const result = new BufferGeometry();
    result.setAttribute("position", new BufferAttribute(positions, 3));
    return result;
  }, []);

  useFrame((_, delta) => {
    const attribute = geometry.getAttribute("position") as BufferAttribute;
    for (let i = 0; i < attribute.count; i++) {
      let y = attribute.getY(i) + delta * 0.04;
      if (y > 3) y = 0;
      attribute.setY(i, y);
    }
    attribute.needsUpdate = true;
    if (points.current) points.current.rotation.y += delta * 0.01;
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        size={0.022}
        map={sprite}
        color={neon("#cfc9ff", 1.4)}
        transparent
        opacity={0.5}
        blending={AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  );
};

// Soft dark patches under the furniture, so it sits on the floor.
const BlobShadow: React.FC<{
  position: [number, number];
  size: [number, number];
}> = ({ position, size }) => {
  const texture = useCanvasTexture(128, 128, (context) => {
    const gradient = context.createRadialGradient(64, 64, 10, 64, 64, 64);
    gradient.addColorStop(0, "rgba(0, 0, 0, 0.55)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
  });
  return (
    <mesh
      position={[position[0], 0.008, position[1]]}
      rotation-x={-Math.PI / 2}
    >
      <planeGeometry args={size} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  );
};

const Decor: React.FC = () => (
  <group>
    <Window />
    <Poster
      position={[-5.98, 1.7, -2.9]}
      rotationY={Math.PI / 2}
      title="Snuggle Sweep"
      tagline="100 levels · 13 languages"
      colors={["#ff8fab", "#6c63ff"]}
    />
    <Diploma />
    {/* Models from Meshy */}
    <Model
      url="/assets/models/coffee-table.glb"
      width={1.1}
      position={[0, 0, 1.1]}
    />
    {/* Controller lying on the coffee table, as if just put down */}
    <Model
      url="/assets/models/controller.glb"
      width={0.17}
      position={[0.22, 0.475, 1.12]}
      rotation={[-Math.PI / 2, 0, 0.5]}
    />
    <Model
      url="/assets/models/aircon.glb"
      width={0.85}
      position={[-5.9, 2.62, 2.8]}
      rotation={[0, Math.PI / 2, 0]}
    />
    <Model
      url="/assets/models/kitten.glb"
      height={0.22}
      position={[5.75, 2.3, -1.95]}
      rotation={[0, -Math.PI / 2, 0]}
    />
    <Model
      url="/assets/models/guitar.glb"
      height={0.95}
      position={[5.72, 0, 0.15]}
      rotation={[0, -Math.PI / 2, 0.12]}
    />
    <Model
      url="/assets/models/flat-tv.glb"
      width={1.2}
      position={[5.97, 1.35, 3.85]}
      rotation={[0, -Math.PI / 2, 0]}
    />
    <Poster
      position={[5.98, 1.7, 2.65]}
      rotationY={-Math.PI / 2}
      title="Grandpa's Notebook"
      tagline="maths game for schools"
      colors={["#ffc46b", "#4fd1c5"]}
    />

    <Sign
      text="</> FULL-STACK"
      position={[3.75, 2.75, -4.96]}
      width={1.8}
      floating={false}
    />
    <Sign
      text="OPEN TO REMOTE WORK"
      position={[-3.75, 2.75, -4.96]}
      width={1.9}
      color="#4fd1c5"
      floating={false}
    />

    <Dust />

    <BlobShadow position={[0, -1.85]} size={[2.6, 1.6]} />
    <BlobShadow position={[-5.4, -1]} size={[1.3, 2.8]} />
    <BlobShadow position={[5.75, -1.3]} size={[0.8, 2.4]} />
    <BlobShadow position={[5.6, 1.4]} size={[0.9, 1.8]} />
    <BlobShadow position={[-5.3, -4.3]} size={[0.9, 0.9]} />
    <BlobShadow position={[5.3, -4.3]} size={[0.8, 0.8]} />
  </group>
);

export default Decor;
