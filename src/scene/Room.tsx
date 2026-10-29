import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  DoubleSide,
  AmbientLight,
  HemisphereLight,
  MeshBasicMaterial,
  PointLight,
} from "three";
import { ROOM } from "./layout";
import { neon } from "./neon";
import { bootLevel } from "../boot";

const WALL = "#3a3a5a";
const ACCENT = "#6c63ff";

export const Plant: React.FC<{
  position: [number, number, number];
  scale?: number;
}> = ({ position, scale = 1 }) => (
  <group position={position} scale={scale}>
    <mesh position={[0, 0.2, 0]}>
      <cylinderGeometry args={[0.18, 0.14, 0.4, 12]} />
      <meshStandardMaterial color="#d9d4ff" roughness={0.6} />
    </mesh>
    <mesh position={[0, 0.62, 0]}>
      <icosahedronGeometry args={[0.32, 0]} />
      <meshStandardMaterial color="#3f8f6b" flatShading roughness={0.8} />
    </mesh>
    <mesh position={[0.1, 0.9, 0.05]}>
      <icosahedronGeometry args={[0.2, 0]} />
      <meshStandardMaterial color="#56b386" flatShading roughness={0.8} />
    </mesh>
  </group>
);

// Thin glowing strip, used along the walls and on the ceiling.
const Strip: React.FC<{
  position: [number, number, number];
  size: [number, number, number];
  color?: string;
  bootDelay?: number;
}> = ({ position, size, color = ACCENT, bootDelay = 1 }) => {
  const material = useRef<MeshBasicMaterial>(null);
  const full = useMemo(() => neon(color), [color]);
  useFrame(() => {
    material.current?.color
      .copy(full)
      .multiplyScalar(bootLevel(bootDelay, true));
  });
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshBasicMaterial ref={material} toneMapped={false} />
    </mesh>
  );
};

// Ceiling and corner lights, switched on one by one when the room boots.
const LIGHTS = [
  {
    position: [0, 2.8, 1.2],
    intensity: 12,
    distance: 12,
    color: "#efeaff",
    delay: 0.15,
  },
  {
    position: [0, 2.8, -2.4],
    intensity: 10,
    distance: 10,
    color: "#efeaff",
    delay: 0.35,
  },
  {
    position: [-3.8, 2.6, -1],
    intensity: 8,
    distance: 7,
    color: "#c9c5ff",
    delay: 0.55,
  },
  {
    position: [3.8, 2.6, 0.4],
    intensity: 8,
    distance: 7,
    color: "#e3c9ff",
    delay: 0.75,
  },
] as const;
// Before the boot the room is not quite black, so the intro has a backdrop.
const DARK = 0.25;

const RoomLights: React.FC = () => {
  const ambient = useRef<AmbientLight>(null);
  const hemisphere = useRef<HemisphereLight>(null);
  const points = useRef<(PointLight | null)[]>([]);
  useFrame(() => {
    const base = DARK + (1 - DARK) * bootLevel(0);
    if (ambient.current) ambient.current.intensity = 0.9 * base;
    if (hemisphere.current) hemisphere.current.intensity = 1.2 * base;
    LIGHTS.forEach((light, index) => {
      const point = points.current[index];
      if (point) point.intensity = light.intensity * bootLevel(light.delay);
    });
  });
  return (
    <>
      <ambientLight ref={ambient} color="#b9b3ff" />
      <hemisphereLight ref={hemisphere} args={["#a9a4ff", "#2a2a3e", 1.2]} />
      {LIGHTS.map((light, index) => (
        <pointLight
          key={index}
          ref={(point) => (points.current[index] = point)}
          position={light.position as unknown as [number, number, number]}
          distance={light.distance}
          color={light.color}
          intensity={0}
        />
      ))}
    </>
  );
};

const Room: React.FC = () => {
  const { width, depth, height } = ROOM;
  const halfW = width / 2;
  const halfD = depth / 2;

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#2a2a3e" roughness={0.85} />
      </mesh>
      <gridHelper args={[width, 24, "#34345a", "#2c2c46"]} position-y={0.002} />
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.006, 0.9]}>
        <circleGeometry args={[2.1, 6]} />
        <meshStandardMaterial color="#3a3266" roughness={1} />
      </mesh>

      <mesh position={[0, height / 2, -halfD]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#34345a" roughness={0.9} />
      </mesh>
      <mesh position={[0, height / 2, halfD]} rotation-y={Math.PI}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color={WALL} roughness={0.9} />
      </mesh>
      <mesh position={[-halfW, height / 2, 0]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[depth, height]} />
        <meshStandardMaterial color={WALL} roughness={0.9} />
      </mesh>
      <mesh position={[halfW, height / 2, 0]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[depth, height]} />
        <meshStandardMaterial color={WALL} roughness={0.9} />
      </mesh>
      <mesh position={[0, height, 0]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#2a2a40" side={DoubleSide} />
      </mesh>

      {/* Glowing skirting along the floor and lights in the ceiling. */}
      <Strip position={[0, 0.04, -halfD + 0.01]} size={[width, 0.02, 0.02]} />
      <Strip position={[-halfW + 0.01, 0.04, 0]} size={[0.02, 0.02, depth]} />
      <Strip
        position={[halfW - 0.01, 0.04, 0]}
        size={[0.02, 0.02, depth]}
        color="#b56cff"
      />
      <Strip
        position={[0, height - 0.01, 1.2]}
        size={[4, 0.02, 0.06]}
        color="#a9a4ff"
      />
      <Strip
        position={[0, height - 0.01, -2.2]}
        size={[4, 0.02, 0.06]}
        color="#a9a4ff"
      />

      <Plant position={[-5.3, 0, -4.3]} scale={1.3} />
      <Plant position={[5.3, 0, -4.3]} scale={1.1} />
      <Plant position={[-5.2, 0, 4.2]} />

      <RoomLights />
    </group>
  );
};

export default Room;
