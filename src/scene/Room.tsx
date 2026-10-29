import React from "react";
import { DoubleSide } from "three";
import { ROOM } from "./layout";

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
}> = ({ position, size, color = ACCENT }) => (
  <mesh position={position}>
    <boxGeometry args={size} />
    <meshBasicMaterial color={color} toneMapped={false} />
  </mesh>
);

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

      <ambientLight intensity={0.9} color="#b9b3ff" />
      <hemisphereLight args={["#a9a4ff", "#2a2a3e", 1.2]} />
      <pointLight
        position={[0, 2.8, 1.2]}
        intensity={12}
        distance={12}
        color="#efeaff"
      />
      <pointLight
        position={[0, 2.8, -2.4]}
        intensity={10}
        distance={10}
        color="#efeaff"
      />
      <pointLight
        position={[-3.8, 2.6, -1]}
        intensity={8}
        distance={7}
        color="#c9c5ff"
      />
      <pointLight
        position={[3.8, 2.6, 0.4]}
        intensity={8}
        distance={7}
        color="#e3c9ff"
      />
    </group>
  );
};

export default Room;
