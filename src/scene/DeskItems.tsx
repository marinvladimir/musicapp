import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, Group, Sprite } from "three";
import { useStore } from "../store";
import { channels } from "../data/cv";
import { tuneTo } from "../tv";
import Interactive from "./Interactive";
import { neon } from "./neon";
import { SANS, roundRect, useCanvasTexture } from "./textures";

const STEAM_PUFFS = 7;
const STEAM_SECONDS = 3.2;

// Mug of coffee with steam curling up from it.
export const SteamingMug: React.FC<{ position: [number, number, number] }> = ({
  position,
}) => {
  const puffs = useRef<(Sprite | null)[]>([]);
  const puff = useCanvasTexture(64, 64, (context) => {
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.6)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
  });

  useFrame(({ clock }) => {
    puffs.current.forEach((sprite, index) => {
      if (!sprite) return;
      const t =
        ((clock.elapsedTime + (index * STEAM_SECONDS) / STEAM_PUFFS) %
          STEAM_SECONDS) /
        STEAM_SECONDS;
      sprite.position.set(
        Math.sin(t * 6 + index) * 0.025,
        0.1 + t * 0.32,
        Math.cos(t * 5 + index) * 0.015,
      );
      sprite.scale.setScalar(0.05 + t * 0.12);
      sprite.material.opacity = Math.sin(t * Math.PI) * 0.35;
    });
  });

  return (
    <group position={position}>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.042, 0.036, 0.1, 20]} />
        <meshStandardMaterial color="#4fd1c5" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.098, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.036, 20]} />
        <meshStandardMaterial color="#3b2418" roughness={0.2} />
      </mesh>
      <mesh position={[0.05, 0.05, 0]} rotation-z={Math.PI / 2}>
        <torusGeometry args={[0.022, 0.007, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#4fd1c5" roughness={0.4} />
      </mesh>
      {Array.from({ length: STEAM_PUFFS }, (_, index) => (
        <sprite key={index} ref={(sprite) => (puffs.current[index] = sprite)}>
          <spriteMaterial
            map={puff}
            transparent
            depthWrite={false}
            opacity={0}
          />
        </sprite>
      ))}
    </group>
  );
};

const SCREEN_W = 360;
const SCREEN_H = 740;
const CLASSES = [
  { time: "08:00", name: "Reformer Basics", spots: "6 spots left" },
  { time: "12:30", name: "Core & Flow", spots: "2 spots left" },
  { time: "18:00", name: "Advanced Reformer", spots: "Full · waitlist" },
];

// Mock-up of the Reformer Studio app's home screen.
const drawApp = (context: CanvasRenderingContext2D, notification: boolean) => {
  context.fillStyle = "#f5f4ff";
  context.fillRect(0, 0, SCREEN_W, SCREEN_H);

  const header = context.createLinearGradient(0, 0, SCREEN_W, 220);
  header.addColorStop(0, "#6c63ff");
  header.addColorStop(1, "#b56cff");
  context.fillStyle = header;
  context.fillRect(0, 0, SCREEN_W, 220);
  context.fillStyle = "#ffffff";
  context.font = `600 18px ${SANS}`;
  context.fillText("9:41", 24, 34);
  context.font = `700 30px ${SANS}`;
  context.fillText("Reformer Studio", 24, 110);
  context.font = `400 18px ${SANS}`;
  context.fillText("Good morning! Ready to move?", 24, 145);
  context.fillStyle = "rgba(255, 255, 255, 0.25)";
  roundRect(context, 24, 165, 150, 36, 18);
  context.fill();
  context.fillStyle = "#ffffff";
  context.font = `600 16px ${SANS}`;
  context.fillText("8 classes left", 42, 189);

  context.fillStyle = "#1d1d3a";
  context.font = `700 22px ${SANS}`;
  context.fillText("Today", 24, 262);
  CLASSES.forEach((item, index) => {
    const y = 285 + index * 118;
    context.fillStyle = "#ffffff";
    roundRect(context, 20, y, SCREEN_W - 40, 104, 18);
    context.fill();
    context.fillStyle = "#6c63ff";
    context.font = `700 20px ${SANS}`;
    context.fillText(item.time, 40, y + 40);
    context.fillStyle = "#1d1d3a";
    context.font = `600 20px ${SANS}`;
    context.fillText(item.name, 120, y + 40);
    context.fillStyle = "#6b6b82";
    context.font = `400 16px ${SANS}`;
    context.fillText(item.spots, 120, y + 70);
    context.fillStyle = index === 2 ? "#d9d7f0" : "#4fd1c5";
    roundRect(context, SCREEN_W - 110, y + 30, 70, 40, 20);
    context.fill();
    context.fillStyle = index === 2 ? "#6b6b82" : "#ffffff";
    context.font = `600 16px ${SANS}`;
    context.fillText(index === 2 ? "Wait" : "Book", SCREEN_W - 97, y + 56);
  });

  context.fillStyle = "#ffffff";
  context.fillRect(0, SCREEN_H - 80, SCREEN_W, 80);
  ["#6c63ff", "#c9c5ff", "#c9c5ff", "#c9c5ff"].forEach((color, index) => {
    context.fillStyle = color;
    context.beginPath();
    context.arc(54 + index * 84, SCREEN_H - 42, 12, 0, Math.PI * 2);
    context.fill();
  });

  if (notification) {
    context.fillStyle = "rgba(29, 29, 58, 0.95)";
    roundRect(context, 16, 46, SCREEN_W - 32, 70, 18);
    context.fill();
    context.fillStyle = "#4fd1c5";
    context.font = `700 18px ${SANS}`;
    context.fillText("✓ Booking confirmed", 36, 78);
    context.fillStyle = "#c9c5ff";
    context.font = `400 15px ${SANS}`;
    context.fillText("Core & Flow · today at 12:30", 36, 102);
  }
};

const NOTIFICATION_EVERY = 7;
const NOTIFICATION_SECONDS = 2.5;

// Phone on a stand, showing the Reformer Studio app. Clicking it opens the
// app's channel on the TV.
export const Phone: React.FC<{
  position: [number, number, number];
  rotationY?: number;
}> = ({ position, rotationY = 0 }) => {
  const goTo = useStore((state) => state.goTo);
  const showing = useRef<boolean | null>(null);
  const group = useRef<Group>(null);
  const channel = useMemo(
    () =>
      channels.findIndex((project) => project.name === "Elan Reformer Studio"),
    [],
  );
  const screen = useCanvasTexture(SCREEN_W, SCREEN_H, (context) =>
    drawApp(context, false),
  );

  // Now and then a booking notification slides in.
  useFrame(({ clock }) => {
    const notification =
      clock.elapsedTime % NOTIFICATION_EVERY < NOTIFICATION_SECONDS;
    if (notification === showing.current) return;
    showing.current = notification;
    const context = (screen.image as HTMLCanvasElement).getContext("2d");
    if (!context) return;
    drawApp(context, notification);
    screen.needsUpdate = true;
  });

  return (
    <Interactive
      label="Reformer Studio app: watch it on the TV"
      onSelect={() => {
        if (channel >= 0) tuneTo(channel);
        goTo("projects");
      }}
    >
      {(hovered) => (
        <group
          ref={group}
          position={position}
          rotation-y={rotationY}
          scale={hovered ? 1.08 : 1}
        >
          {/* Stand */}
          <mesh position={[0, 0.012, 0.01]}>
            <boxGeometry args={[0.07, 0.024, 0.05]} />
            <meshStandardMaterial color="#e8e6ff" roughness={0.5} />
          </mesh>
          <group position={[0, 0.085, 0]} rotation-x={-0.32}>
            <mesh>
              <boxGeometry args={[0.078, 0.158, 0.009]} />
              <meshStandardMaterial
                color="#14141f"
                metalness={0.4}
                roughness={0.3}
              />
            </mesh>
            <mesh position={[0, 0, 0.0047]}>
              <planeGeometry args={[0.07, 0.146]} />
              <meshBasicMaterial
                map={screen}
                color={neon("#ffffff", hovered ? 1.15 : 1)}
                toneMapped={false}
              />
            </mesh>
            {/* Light from the screen on the desk */}
            <mesh position={[0, -0.02, 0.06]} rotation-x={-1.2}>
              <planeGeometry args={[0.12, 0.12]} />
              <meshBasicMaterial
                color="#8f88ff"
                transparent
                opacity={0.08}
                blending={AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
          </group>
        </group>
      )}
    </Interactive>
  );
};
