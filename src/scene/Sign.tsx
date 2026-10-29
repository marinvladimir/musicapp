import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import { SANS, useCanvasTexture } from "./textures";

// Floating neon label that marks a station in the room.
const Sign: React.FC<{
  text: string;
  position: [number, number, number];
  rotationY?: number;
  color?: string;
  floating?: boolean;
}> = ({
  text,
  position,
  rotationY = 0,
  color = "#b56cff",
  floating = true,
}) => {
  const group = useRef<Group>(null);
  const texture = useCanvasTexture(
    512,
    160,
    (context) => {
      context.clearRect(0, 0, 512, 160);
      context.font = `700 92px ${SANS}`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.shadowColor = color;
      context.shadowBlur = 28;
      context.fillStyle = color;
      context.fillText(text, 256, 84);
      context.shadowBlur = 0;
      context.fillStyle = "#ffffff";
      context.fillText(text, 256, 84);
    },
    [text, color],
  );

  useFrame(({ clock }) => {
    if (group.current && floating) {
      group.current.position.y =
        position[1] + Math.sin(clock.elapsedTime * 1.4 + position[0]) * 0.03;
    }
  });

  return (
    <group ref={group} position={position} rotation-y={rotationY}>
      <mesh>
        <planeGeometry args={[0.8, 0.25]} />
        <meshBasicMaterial map={texture} transparent toneMapped={false} />
      </mesh>
    </group>
  );
};

export default Sign;
