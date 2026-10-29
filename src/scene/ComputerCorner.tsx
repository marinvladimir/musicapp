import React from "react";
import { useStore } from "../store";
import { clientWork, ownProducts } from "../data/cv";
import Interactive from "./Interactive";
import Sign from "./Sign";
import { MONO, SANS, roundRect, useCanvasTexture } from "./textures";

const SCREEN_W = 1280;
const SCREEN_H = 720;
const ICON_COLORS = ["#6c63ff", "#b56cff", "#4fd1c5", "#ff8fab", "#ffc46b"];

const drawDesktop = (context: CanvasRenderingContext2D) => {
  const wallpaper = context.createLinearGradient(0, 0, SCREEN_W, SCREEN_H);
  wallpaper.addColorStop(0, "#15152c");
  wallpaper.addColorStop(1, "#3b2a6b");
  context.fillStyle = wallpaper;
  context.fillRect(0, 0, SCREEN_W, SCREEN_H);

  context.fillStyle = "rgba(0, 0, 0, 0.45)";
  context.fillRect(0, 0, SCREEN_W, 48);
  context.fillStyle = "#c9c6ff";
  context.font = `400 24px ${MONO}`;
  context.fillText("marin@dev: ~/projects", 24, 32);
  context.textAlign = "right";
  context.fillText("● ● ●", SCREEN_W - 24, 32);
  context.textAlign = "left";

  const projects = [...ownProducts, ...clientWork].slice(0, 8);
  const columns = 4;
  const cell = 280;
  const startX = (SCREEN_W - columns * cell) / 2;
  projects.forEach((project, index) => {
    const x = startX + (index % columns) * cell + cell / 2;
    const y = 110 + Math.floor(index / columns) * 250;
    context.fillStyle = ICON_COLORS[index % ICON_COLORS.length];
    roundRect(context, x - 64, y, 128, 128, 28);
    context.fill();
    context.fillStyle = "#ffffff";
    context.font = `700 54px ${SANS}`;
    context.textAlign = "center";
    const initials = project.name
      .split(/[\s.']+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join("");
    context.fillText(initials, x, y + 84);
    context.font = `500 26px ${SANS}`;
    context.fillStyle = "#ecebff";
    context.fillText(project.name, x, y + 172, cell - 20);
    context.textAlign = "left";
  });

  context.fillStyle = "rgba(108, 99, 255, 0.9)";
  roundRect(context, SCREEN_W / 2 - 230, SCREEN_H - 92, 460, 60, 30);
  context.fill();
  context.fillStyle = "#ffffff";
  context.font = `700 28px ${SANS}`;
  context.textAlign = "center";
  context.fillText("Click to open my projects", SCREEN_W / 2, SCREEN_H - 52);
  context.textAlign = "left";
};

const ComputerCorner: React.FC = () => {
  const goTo = useStore((state) => state.goTo);
  const screen = useCanvasTexture(SCREEN_W, SCREEN_H, drawDesktop);

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

      <Interactive label="Browse my projects" onSelect={() => goTo("projects")}>
        {(hovered) => (
          <group position={[0, 1.3, -0.18]}>
            <mesh position={[0, 0, -0.03]}>
              <boxGeometry args={[1.2, 0.72, 0.04]} />
              <meshStandardMaterial color="#0d0d16" roughness={0.4} />
            </mesh>
            <mesh>
              <planeGeometry args={[1.14, 0.64]} />
              <meshBasicMaterial
                map={screen}
                toneMapped={false}
                color={hovered ? "#ffffff" : "#d8d8e8"}
              />
            </mesh>
            <mesh position={[0, -0.47, -0.04]}>
              <boxGeometry args={[0.06, 0.24, 0.04]} />
              <meshStandardMaterial color="#2a2a3b" />
            </mesh>
            <pointLight
              position={[0, 0, 0.4]}
              intensity={2.5}
              distance={3}
              color="#7f75ff"
            />
          </group>
        )}
      </Interactive>

      {/* Keyboard and mouse */}
      <mesh position={[0, 0.79, 0.12]}>
        <boxGeometry args={[0.6, 0.025, 0.18]} />
        <meshStandardMaterial color="#2a2a3b" />
      </mesh>
      <mesh position={[0, 0.805, 0.12]}>
        <boxGeometry args={[0.56, 0.006, 0.15]} />
        <meshBasicMaterial color="#6c63ff" toneMapped={false} />
      </mesh>
      <mesh position={[0.45, 0.79, 0.14]}>
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
          <meshBasicMaterial color="#4fd1c5" toneMapped={false} />
        </mesh>
      </group>

      {/* Chair, pulled out to the side so it does not hide the monitor */}
      <group position={[0.75, 0, 0.85]} rotation-y={-0.7}>
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
