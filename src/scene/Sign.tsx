import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MeshBasicMaterial } from "three";
import { bootLevel } from "../boot";
import { SANS, useCanvasTexture } from "./textures";
import { neon } from "./neon";

// Neon label: marks a station (floating) or decorates a wall.
const Sign: React.FC<{
  text: string;
  position: [number, number, number];
  rotationY?: number;
  color?: string;
  floating?: boolean;
  width?: number;
  bootDelay?: number;
}> = ({
  text,
  position,
  rotationY = 0,
  color = "#b56cff",
  floating = true,
  width = 0.8,
  bootDelay = 1.3,
}) => {
  const group = useRef<Group>(null);
  const texture = useCanvasTexture(
    1024,
    320,
    (context) => {
      context.clearRect(0, 0, 1024, 320);
      context.font = `700 150px ${SANS}`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.shadowColor = color;
      context.shadowBlur = 40;
      context.fillStyle = color;
      context.fillText(text, 512, 168, 980);
      context.shadowBlur = 0;
      context.fillStyle = "#ffffff";
      context.fillText(text, 512, 168, 980);
    },
    [text, color],
  );

  const material = useRef<MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    if (material.current) material.current.opacity = bootLevel(bootDelay, true);
    if (group.current && floating) {
      group.current.position.y =
        position[1] + Math.sin(clock.elapsedTime * 1.4 + position[0]) * 0.03;
    }
  });

  return (
    <group ref={group} position={position} rotation-y={rotationY}>
      <mesh>
        <planeGeometry args={[width, width * 0.3125]} />
        <meshBasicMaterial
          ref={material}
          map={texture}
          color={neon("#ffffff", 2.4)}
          transparent
          toneMapped={false}
        />
      </mesh>
    </group>
  );
};

export default Sign;
