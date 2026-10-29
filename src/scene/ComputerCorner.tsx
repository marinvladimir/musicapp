import React, { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useStore } from "../store";
import { channels } from "../data/cv";
import { OSD_SECONDS, STATIC_SECONDS, changeChannel } from "../tv";
import { drawOsd, drawScanlines, drawStatic, drawTestCard } from "../tvDraw";
import Interactive from "./Interactive";
import Sign from "./Sign";
import { neon } from "./neon";
import { useCanvasTexture, whenFontsReady } from "./textures";

const SCREEN_W = 640;
const SCREEN_H = 480;

// Retro CRT TV. Every project is a channel, with static between channels.
const TvSet: React.FC = () => {
  const goTo = useStore((state) => state.goTo);
  const channel = useStore((state) => state.channel);
  const screen = useCanvasTexture(SCREEN_W, SCREEN_H, () => undefined);
  const lastDrawn = useRef("");
  const fontsLoaded = useRef(false);
  const video = useRef<HTMLVideoElement | null>(null);
  const demo = channels[channel].demo;

  useEffect(() => {
    whenFontsReady().then(() => (fontsLoaded.current = true));
  }, []);

  useEffect(() => {
    if (!demo) return;
    const element = document.createElement("video");
    element.src = demo;
    element.muted = true;
    element.loop = true;
    element.playsInline = true;
    element.play().catch(() => undefined);
    video.current = element;
    return () => {
      element.pause();
      element.removeAttribute("src");
      video.current = null;
    };
  }, [demo]);

  useFrame(() => {
    const context = (screen.image as HTMLCanvasElement).getContext("2d");
    if (!context || !fontsLoaded.current) return;
    const { channel: current, channelChangedAt } = useStore.getState();
    const elapsed = (performance.now() - channelChangedAt) / 1000;
    const showOsd = elapsed < OSD_SECONDS;

    if (elapsed < STATIC_SECONDS) {
      drawStatic(context, SCREEN_W, SCREEN_H);
      lastDrawn.current = "";
    } else if (video.current && video.current.readyState >= 2) {
      context.drawImage(video.current, 0, 0, SCREEN_W, SCREEN_H);
      if (showOsd) drawOsd(context, SCREEN_W, SCREEN_H, current + 1);
      lastDrawn.current = "";
    } else {
      // The test card only changes with the channel and the on-screen number.
      const key = `${current}-${showOsd}`;
      if (key === lastDrawn.current) return;
      drawTestCard(context, SCREEN_W, SCREEN_H, channels[current]);
      if (showOsd) drawOsd(context, SCREEN_W, SCREEN_H, current + 1);
      lastDrawn.current = key;
    }
    drawScanlines(context, SCREEN_W, SCREEN_H);
    screen.needsUpdate = true;
  });

  return (
    <group position={[-0.15, 0.78, -0.15]}>
      <Interactive
        label="Watch my projects on TV"
        onSelect={() => goTo("projects")}
      >
        {(hovered) => (
          <group>
            <mesh position={[0, 0.42, 0]}>
              <boxGeometry args={[1.1, 0.84, 0.5]} />
              <meshStandardMaterial
                color={hovered ? "#3a3266" : "#2b2b3b"}
                roughness={0.5}
              />
            </mesh>
            {/* Screen with a dark rim */}
            <mesh position={[-0.12, 0.44, 0.252]}>
              <planeGeometry args={[0.8, 0.64]} />
              <meshStandardMaterial color="#050508" roughness={0.3} />
            </mesh>
            <mesh position={[-0.12, 0.44, 0.254]}>
              <planeGeometry args={[0.74, 0.555]} />
              <meshBasicMaterial map={screen} toneMapped={false} />
            </mesh>
            {/* Speaker grille */}
            {[0, 1, 2, 3, 4].map((index) => (
              <mesh key={index} position={[0.4, 0.24 + index * 0.035, 0.252]}>
                <planeGeometry args={[0.16, 0.012]} />
                <meshStandardMaterial color="#14141f" />
              </mesh>
            ))}
            <mesh position={[0.4, 0.12, 0.252]}>
              <circleGeometry args={[0.012, 12]} />
              <meshBasicMaterial
                color={neon("#ff6b6b", 2.5)}
                toneMapped={false}
              />
            </mesh>
            {/* Rabbit-ear antenna */}
            {[-0.5, 0.5].map((angle) => (
              <mesh
                key={angle}
                position={[
                  Math.sin(angle) * 0.22,
                  0.84 + Math.cos(angle) * 0.22,
                  -0.05,
                ]}
                rotation-z={-angle}
              >
                <cylinderGeometry args={[0.006, 0.006, 0.46, 6]} />
                <meshStandardMaterial
                  color="#c9c9dd"
                  metalness={0.7}
                  roughness={0.3}
                />
              </mesh>
            ))}
            <mesh position={[0, 0.86, -0.05]}>
              <sphereGeometry
                args={[0.05, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]}
              />
              <meshStandardMaterial color="#1c1c28" />
            </mesh>
            <pointLight
              position={[-0.12, 0.44, 0.6]}
              intensity={2}
              distance={2.5}
              color="#a9c8ff"
            />
          </group>
        )}
      </Interactive>

      {/* Channel knob: switches to the next project */}
      <Interactive label="Next channel" onSelect={() => changeChannel(1)}>
        {(hovered) => (
          <mesh position={[0.4, 0.56, 0.27]} rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.05, 0.05, 0.04, 20]} />
            <meshStandardMaterial
              color={hovered ? "#b56cff" : "#c9c9dd"}
              metalness={0.5}
              roughness={0.4}
            />
          </mesh>
        )}
      </Interactive>
      <mesh position={[0.4, 0.7, 0.262]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.035, 0.035, 0.03, 16]} />
        <meshStandardMaterial color="#8c8ca3" metalness={0.5} />
      </mesh>
    </group>
  );
};

const ComputerCorner: React.FC = () => {
  return (
    // Built facing +x, against the left wall.
    <group position={[-5.45, 0, -1]} rotation-y={Math.PI / 2}>
      {/* Desk */}
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[2.2, 0.06, 0.8]} />
        <meshStandardMaterial color="#e8e6ff" roughness={0.5} />
      </mesh>
      {[-1.05, 1.05].map((x) => (
        <mesh key={x} position={[x, 0.36, 0]}>
          <boxGeometry args={[0.06, 0.72, 0.7]} />
          <meshStandardMaterial color="#b56cff" roughness={0.4} />
        </mesh>
      ))}

      <TvSet />

      {/* Keyboard and mouse */}
      <mesh position={[0, 0.79, 0.28]}>
        <boxGeometry args={[0.6, 0.025, 0.18]} />
        <meshStandardMaterial color="#2a2a3b" />
      </mesh>
      <mesh position={[0, 0.805, 0.28]}>
        <boxGeometry args={[0.56, 0.006, 0.15]} />
        <meshBasicMaterial color={neon("#6c63ff", 2)} toneMapped={false} />
      </mesh>
      <mesh position={[0.45, 0.79, 0.3]}>
        <boxGeometry args={[0.06, 0.025, 0.1]} />
        <meshStandardMaterial color="#2a2a3b" />
      </mesh>

      {/* PC tower with a light strip */}
      <group position={[0.85, 0, -0.05]}>
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[0.22, 0.5, 0.48]} />
          <meshStandardMaterial color="#14141f" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.25, 0.241]}>
          <planeGeometry args={[0.03, 0.42]} />
          <meshBasicMaterial color={neon("#4fd1c5")} toneMapped={false} />
        </mesh>
      </group>

      {/* Chair, pulled out to the side so it does not hide the monitor */}
      <group position={[1.05, 0, 0.95]} rotation-y={-1.1}>
        <mesh position={[0, 0.48, 0]}>
          <boxGeometry args={[0.5, 0.08, 0.48]} />
          <meshStandardMaterial color="#3a3266" />
        </mesh>
        <mesh position={[0, 0.85, 0.22]}>
          <boxGeometry args={[0.5, 0.65, 0.06]} />
          <meshStandardMaterial color="#3a3266" />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.44, 8]} />
          <meshStandardMaterial color="#888" metalness={0.6} />
        </mesh>
      </group>

      <Sign text="PROJECTS" position={[0, 2.05, -0.2]} />
    </group>
  );
};

export default ComputerCorner;
