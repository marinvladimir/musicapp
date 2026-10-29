import React, { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  CanvasTexture,
  Mesh,
  Object3D,
  SRGBColorSpace,
  Vector3,
  MeshBasicMaterial,
  SpotLight,
} from "three";
import { MONO, SANS, whenFontsReady } from "./textures";
import { WORLD_MAP } from "../data/worldMap";
import { neon } from "./neon";
import { bootLevel } from "../boot";

type Draw = (
  context: CanvasRenderingContext2D,
  time: number,
  width: number,
  height: number,
) => void;

const ACCENT = "#6c63ff";
const TEAL = "#4fd1c5";
const PURPLE = "#b56cff";

// Every few seconds the picture tears for a moment: strips slide sideways
// and the colour channels split, like a bad digital signal.
const glitch = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
) => {
  const canvas = context.canvas;
  for (let i = 0; i < 6; i++) {
    const y = Math.random() * height;
    const strip = 4 + Math.random() * height * 0.08;
    const shift = (Math.random() - 0.5) * width * 0.15;
    context.drawImage(canvas, 0, y, width, strip, shift, y, width, strip);
  }
  context.globalCompositeOperation = "lighter";
  context.globalAlpha = 0.35;
  context.drawImage(canvas, 6, 0);
  context.globalAlpha = 1;
  context.globalCompositeOperation = "source-over";
  context.fillStyle =
    Math.random() > 0.5 ? "rgba(255, 0, 120, 0.25)" : "rgba(0, 255, 230, 0.25)";
  context.fillRect(0, Math.random() * height, width, 3 + Math.random() * 10);
};

const AnimatedPanel: React.FC<{
  position: [number, number, number];
  rotationY?: number;
  size: [number, number];
  draw: Draw;
  fps?: number;
}> = ({ position, rotationY = 0, size, draw, fps = 15 }) => {
  const width = 512;
  const height = Math.round((512 * size[1]) / size[0]);
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const result = new CanvasTexture(canvas);
    result.colorSpace = SRGBColorSpace;
    return result;
  }, [width, height]);
  const screen = useRef<MeshBasicMaterial>(null);
  const state = useRef({
    last: -1,
    glitchUntil: 0,
    nextGlitch: 2 + Math.random() * 4,
    ready: false,
  });

  useEffect(() => {
    whenFontsReady().then(() => (state.current.ready = true));
  }, []);

  useFrame(({ clock }) => {
    const now = clock.elapsedTime;
    const current = state.current;
    screen.current?.color.setScalar(bootLevel(1.5, true));
    if (!current.ready || now - current.last < 1 / fps) return;
    current.last = now;
    const context = (texture.image as HTMLCanvasElement).getContext("2d")!;
    draw(context, now, width, height);
    if (now > current.nextGlitch) {
      current.glitchUntil = now + 0.12 + Math.random() * 0.2;
      current.nextGlitch = now + 3 + Math.random() * 5;
    }
    if (now < current.glitchUntil) glitch(context, width, height);
    texture.needsUpdate = true;
  });

  return (
    <group position={position} rotation-y={rotationY}>
      <mesh position={[0, 0, -0.012]}>
        <boxGeometry args={[size[0] + 0.06, size[1] + 0.06, 0.02]} />
        <meshStandardMaterial color="#0d0d16" roughness={0.4} />
      </mesh>
      {/* Thin glowing frame */}
      <mesh position={[0, 0, -0.001]}>
        <planeGeometry args={[size[0] + 0.03, size[1] + 0.03]} />
        <meshBasicMaterial color={neon(ACCENT, 1.6)} toneMapped={false} />
      </mesh>
      <mesh>
        <planeGeometry args={size} />
        <meshBasicMaterial ref={screen} map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
};

// --- Network graph: services talking to each other ---------------------

const NODE_LABELS = [
  "api",
  "auth",
  "db",
  "cdn",
  "queue",
  "edge",
  "cache",
  "app",
  "ci",
  "k8s",
  "iam",
  "push",
];

const useNetwork = () =>
  useMemo(() => {
    const nodes = NODE_LABELS.map((label, index) => ({
      label,
      x: 0.1 + Math.random() * 0.8,
      y: 0.15 + Math.random() * 0.7,
      phase: index,
    }));
    const edges: [number, number][] = [];
    nodes.forEach((_, a) => {
      const nearest = nodes
        .map((node, b) => ({
          b,
          d: Math.hypot(node.x - nodes[a].x, node.y - nodes[a].y),
        }))
        .filter(({ b }) => b !== a)
        .sort((p, q) => p.d - q.d)
        .slice(0, 2);
      nearest.forEach(({ b }) => {
        if (
          !edges.some(([p, q]) => (p === b && q === a) || (p === a && q === b))
        )
          edges.push([a, b]);
      });
    });
    return { nodes, edges };
  }, []);

const NetworkPanel: React.FC<{
  position: [number, number, number];
  rotationY?: number;
  size: [number, number];
}> = (props) => {
  const { nodes, edges } = useNetwork();
  const draw: Draw = (context, time, width, height) => {
    context.fillStyle = "#0b0b16";
    context.fillRect(0, 0, width, height);
    context.strokeStyle = "rgba(108, 99, 255, 0.12)";
    context.lineWidth = 1;
    for (let x = 0; x < width; x += 32) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }
    for (let y = 0; y < height; y += 32) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }

    const point = (index: number) => {
      const node = nodes[index];
      return {
        x: (node.x + Math.sin(time * 0.3 + node.phase) * 0.01) * width,
        y: (node.y + Math.cos(time * 0.25 + node.phase) * 0.012) * height,
      };
    };

    edges.forEach(([a, b], index) => {
      const from = point(a);
      const to = point(b);
      context.strokeStyle = "rgba(79, 209, 197, 0.45)";
      context.lineWidth = 1.5;
      context.beginPath();
      context.moveTo(from.x, from.y);
      context.lineTo(to.x, to.y);
      context.stroke();
      // A data packet travelling along the link.
      const t = (time * 0.4 + index * 0.37) % 1;
      context.fillStyle = index % 3 === 0 ? PURPLE : TEAL;
      context.beginPath();
      context.arc(
        from.x + (to.x - from.x) * t,
        from.y + (to.y - from.y) * t,
        3,
        0,
        Math.PI * 2,
      );
      context.fill();
    });

    context.font = `500 15px ${MONO}`;
    nodes.forEach((node, index) => {
      const { x, y } = point(index);
      const pulse = 7 + Math.sin(time * 2 + node.phase) * 1.5;
      context.fillStyle = "rgba(108, 99, 255, 0.3)";
      context.beginPath();
      context.arc(x, y, pulse + 6, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = ACCENT;
      context.beginPath();
      context.arc(x, y, pulse, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "#e8e6ff";
      context.fillText(node.label, x + 14, y + 5);
    });

    context.fillStyle = TEAL;
    context.font = `500 16px ${MONO}`;
    context.fillText("● NETWORK  ·  12 services  ·  all healthy", 16, 26);
  };
  return <AnimatedPanel {...props} draw={draw} />;
};

// --- Terminal with code scrolling by ------------------------------------

const CODE = [
  ["k", "export async function ", "f", "deploy", "p", "(env: Env) {"],
  ["p", "  const build = await ", "f", "bundle", "p", "({ minify: true });"],
  ["k", "  await ", "p", "helm.", "f", "upgrade", "p", '("api", build);'],
  ["c", "  // zero-downtime rollout"],
  ["k", "  return ", "s", '"✔ shipped"', "p", ";"],
  ["p", "}"],
  ["p", ""],
  [
    "k",
    "const ",
    "p",
    "user = ",
    "k",
    "await ",
    "f",
    "keycloak",
    "p",
    ".verify(token);",
  ],
  [
    "k",
    "if ",
    "p",
    "(!user.roles.",
    "f",
    "includes",
    "p",
    '("admin")) ',
    "k",
    "throw ",
    "p",
    "403;",
  ],
  ["p", ""],
  ["c", "// Stripe webhook → Firestore"],
  [
    "p",
    "app.",
    "f",
    "post",
    "p",
    "(",
    "s",
    '"/webhook"',
    "p",
    ", ",
    "k",
    "async ",
    "p",
    "(req) => {",
  ],
  ["p", "  const event = stripe.", "f", "constructEvent", "p", "(req);"],
  [
    "p",
    "  await db.",
    "f",
    "collection",
    "p",
    "(",
    "s",
    '"payments"',
    "p",
    ").add(event);",
  ],
  ["p", "});"],
  ["p", ""],
  ["s", "$ ", "p", "eas build --platform all"],
  ["c", "✔ iOS and Android builds queued"],
  ["s", "$ ", "p", "docker compose up -d"],
  ["c", "✔ api  ✔ db  ✔ worker"],
];
const COLORS: Record<string, string> = {
  k: PURPLE,
  f: TEAL,
  s: "#ffc46b",
  c: "#6b6b8f",
  p: "#d9d7f5",
};

const TerminalPanel: React.FC<{
  position: [number, number, number];
  rotationY?: number;
  size: [number, number];
}> = (props) => {
  const draw: Draw = (context, time, width, height) => {
    context.fillStyle = "#0b0b16";
    context.fillRect(0, 0, width, height);
    context.fillStyle = "#1b1b2e";
    context.fillRect(0, 0, width, 30);
    ["#ff6b6b", "#ffc46b", TEAL].forEach((color, index) => {
      context.fillStyle = color;
      context.beginPath();
      context.arc(18 + index * 18, 15, 5, 0, Math.PI * 2);
      context.fill();
    });
    context.fillStyle = "#8e8aad";
    context.font = `400 14px ${MONO}`;
    context.fillText("marin@dev: ~/ship-it", 80, 20);

    const lineHeight = 22;
    const visible = Math.floor((height - 40) / lineHeight);
    const scroll = Math.floor(time * 2.5);
    context.font = `400 15px ${MONO}`;
    for (let row = 0; row < visible; row++) {
      const line = CODE[(scroll + row) % CODE.length];
      let x = 14;
      const y = 56 + row * lineHeight;
      for (let i = 0; i < line.length; i += 2) {
        context.fillStyle = COLORS[line[i]];
        context.fillText(line[i + 1], x, y);
        x += context.measureText(line[i + 1]).width;
      }
    }
    if (Math.floor(time * 2) % 2 === 0) {
      context.fillStyle = TEAL;
      context.fillRect(14, 56 + (visible - 1) * lineHeight + 4, 9, 3);
    }
  };
  return <AnimatedPanel {...props} draw={draw} />;
};

// --- Falling code, on the wall behind the entrance ---------------------

const RainPanel: React.FC<{
  position: [number, number, number];
  rotationY?: number;
  size: [number, number];
}> = (props) => {
  const columns = useRef<number[]>([]);
  const draw: Draw = (context, _time, width, height) => {
    const size = 16;
    const count = Math.floor(width / size);
    if (columns.current.length !== count) {
      columns.current = Array.from(
        { length: count },
        () => Math.random() * -40,
      );
      context.fillStyle = "#0b0b16";
      context.fillRect(0, 0, width, height);
    }
    context.fillStyle = "rgba(11, 11, 22, 0.18)";
    context.fillRect(0, 0, width, height);
    context.font = `500 ${size}px ${MONO}`;
    columns.current.forEach((row, index) => {
      const character = "01{}<>/=;$#λ".charAt(Math.floor(Math.random() * 12));
      context.fillStyle =
        Math.random() > 0.97 ? "#ffffff" : index % 4 === 0 ? PURPLE : TEAL;
      context.fillText(character, index * size, row * size);
      columns.current[index] =
        row * size > height && Math.random() > 0.96 ? 0 : row + 1;
    });
  };
  return <AnimatedPanel {...props} draw={draw} fps={18} />;
};

// --- Ceiling spotlights with visible beams --------------------------------

// Beams fade out from the lamp towards the floor.
const useBeamFade = () =>
  useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 4;
    canvas.height = 128;
    const context = canvas.getContext("2d")!;
    const gradient = context.createLinearGradient(0, 0, 0, 128);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(1, "#000000");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 4, 128);
    return new CanvasTexture(canvas);
  }, []);

const Spot: React.FC<{
  position: [number, number, number];
  target: [number, number, number];
  color?: string;
  intensity?: number;
  bootDelay?: number;
}> = ({
  position,
  target,
  color = "#cfc9ff",
  intensity = 22,
  bootDelay = 0.6,
}) => {
  const fade = useBeamFade();
  const light = useRef<SpotLight>(null);
  const beamMaterial = useRef<MeshBasicMaterial>(null);
  useFrame(() => {
    const level = bootLevel(bootDelay);
    if (light.current) light.current.intensity = intensity * level;
    if (beamMaterial.current) beamMaterial.current.opacity = 0.09 * level;
  });
  const targetObject = useMemo(() => {
    const object = new Object3D();
    object.position.set(...target);
    return object;
  }, [target]);

  const { length, radius, midpoint, to } = useMemo(() => {
    const from = new Vector3(...position);
    const to = new Vector3(...target);
    const distance = from.distanceTo(to);
    return {
      length: distance,
      radius: Math.tan(0.32) * distance,
      midpoint: from.clone().add(to).multiplyScalar(0.5),
      to,
    };
  }, [position, target]);

  // The cone's tip is at +y: point -y at the target so it widens downwards.
  const aimBeam = (mesh: Mesh | null) => {
    if (!mesh) return;
    mesh.position.copy(midpoint);
    mesh.lookAt(to);
    mesh.rotateX(-Math.PI / 2);
  };

  return (
    <group>
      <primitive object={targetObject} />
      <spotLight
        ref={light}
        position={position}
        target={targetObject}
        angle={0.36}
        penumbra={0.6}
        intensity={intensity}
        distance={7}
        color={color}
      />
      {/* Lamp housing on the ceiling track */}
      <mesh position={position}>
        <cylinderGeometry args={[0.07, 0.09, 0.16, 16]} />
        <meshStandardMaterial color="#1c1c28" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh
        position={[position[0], position[1] - 0.081, position[2]]}
        rotation-x={Math.PI / 2}
      >
        <circleGeometry args={[0.065, 16]} />
        <meshBasicMaterial color={neon("#ffffff", 3)} toneMapped={false} />
      </mesh>
      <mesh ref={aimBeam}>
        <coneGeometry args={[radius, length, 32, 1, true]} />
        <meshBasicMaterial
          color={color}
          alphaMap={fade}
          transparent
          ref={beamMaterial}
          opacity={0}
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
};

// --- World map with the places I have worked with teams in ---------------

const PLACES = [
  { name: "Split · home", lat: 43.5, lon: 16.4, labelDx: 10, labelDy: 18 },
  {
    name: "Germany · Bundesdruckerei",
    lat: 52.5,
    lon: 13.4,
    labelDx: -10,
    labelDy: -12,
    alignRight: true,
  },
  {
    name: "Sydney · Aspose",
    lat: -33.9,
    lon: 151.2,
    labelDx: -10,
    labelDy: -12,
    alignRight: true,
  },
];

const MapPanel: React.FC<{
  position: [number, number, number];
  rotationY?: number;
  size: [number, number];
}> = (props) => {
  const draw: Draw = (context, time, width, height) => {
    context.fillStyle = "#0b0b16";
    context.fillRect(0, 0, width, height);
    const top = 40;
    const mapHeight = height - top - 8;
    const columns = WORLD_MAP.rows[0].length;
    const rows = WORLD_MAP.rows.length;
    const project = (lat: number, lon: number) => ({
      x: ((lon + 180) / 360) * width,
      y:
        top +
        ((WORLD_MAP.north - lat) / (WORLD_MAP.north - WORLD_MAP.south)) *
          mapHeight,
    });

    context.fillStyle = "rgba(169, 164, 255, 0.35)";
    const cellW = width / columns;
    const cellH = mapHeight / rows;
    WORLD_MAP.rows.forEach((row, y) => {
      for (let x = 0; x < columns; x++) {
        if (row[x] !== "#") continue;
        context.beginPath();
        context.arc(
          (x + 0.5) * cellW,
          top + (y + 0.5) * cellH,
          1.3,
          0,
          Math.PI * 2,
        );
        context.fill();
      }
    });

    const home = project(PLACES[0].lat, PLACES[0].lon);
    PLACES.slice(1).forEach((place, index) => {
      const to = project(place.lat, place.lon);
      const control = {
        x: (home.x + to.x) / 2,
        y: Math.min(home.y, to.y) - 30 - Math.abs(to.x - home.x) * 0.15,
      };
      context.strokeStyle = "rgba(79, 209, 197, 0.6)";
      context.lineWidth = 1.5;
      context.beginPath();
      context.moveTo(home.x, home.y);
      context.quadraticCurveTo(control.x, control.y, to.x, to.y);
      context.stroke();
      // A packet travelling between home and the team.
      const t = (time * 0.35 + index * 0.5) % 1;
      const x =
        (1 - t) * (1 - t) * home.x + 2 * (1 - t) * t * control.x + t * t * to.x;
      const y =
        (1 - t) * (1 - t) * home.y + 2 * (1 - t) * t * control.y + t * t * to.y;
      context.fillStyle = "#ffffff";
      context.beginPath();
      context.arc(x, y, 2.5, 0, Math.PI * 2);
      context.fill();
    });

    context.font = `500 13px ${MONO}`;
    PLACES.forEach((place, index) => {
      const { x, y } = project(place.lat, place.lon);
      const pulse = (time * 0.8 + index * 0.3) % 1;
      context.strokeStyle = `rgba(79, 209, 197, ${1 - pulse})`;
      context.lineWidth = 2;
      context.beginPath();
      context.arc(x, y, 4 + pulse * 12, 0, Math.PI * 2);
      context.stroke();
      context.fillStyle = index === 0 ? TEAL : PURPLE;
      context.beginPath();
      context.arc(x, y, 4, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "#e8e6ff";
      context.textAlign = place.alignRight ? "right" : "left";
      context.fillText(place.name, x + place.labelDx, y + place.labelDy);
    });
    context.textAlign = "left";

    context.fillStyle = TEAL;
    context.font = `500 16px ${MONO}`;
    context.fillText(
      "● REMOTE TEAMS  ·  Croatia · Germany · Australia",
      16,
      26,
    );
  };
  return <AnimatedPanel {...props} draw={draw} />;
};

// --- Career timeline ----------------------------------------------------

const CAREER = [
  { years: "2013–19", title: "FESB", detail: "M.Sc. in ICT" },
  { years: "2018–20", title: "Ericsson", detail: "Software developer" },
  { years: "2020–21", title: "Aspose", detail: "Support lead · remote" },
  { years: "2021–24", title: "Bundesdruckerei", detail: "Software engineer" },
  { years: "2025–", title: "Freelance", detail: "Full-stack & mobile" },
];

const TimelinePanel: React.FC<{
  position: [number, number, number];
  rotationY?: number;
  size: [number, number];
}> = (props) => {
  const draw: Draw = (context, time, width, height) => {
    context.fillStyle = "#0b0b16";
    context.fillRect(0, 0, width, height);
    context.fillStyle = TEAL;
    context.font = `500 16px ${MONO}`;
    context.fillText("● CAREER  ·  2013 → now", 16, 26);

    const lineY = height * 0.56;
    const left = 50;
    const right = width - 50;
    const gradient = context.createLinearGradient(left, 0, right, 0);
    gradient.addColorStop(0, ACCENT);
    gradient.addColorStop(1, TEAL);
    context.strokeStyle = gradient;
    context.lineWidth = 4;
    context.shadowColor = ACCENT;
    context.shadowBlur = 12;
    context.beginPath();
    context.moveTo(left - 20, lineY);
    context.lineTo(right + 20, lineY);
    context.stroke();
    context.shadowBlur = 0;

    // A pulse running along the line towards today.
    const pulseX = left - 20 + ((time * 0.25) % 1) * (right - left + 40);
    const glow = context.createRadialGradient(
      pulseX,
      lineY,
      0,
      pulseX,
      lineY,
      26,
    );
    glow.addColorStop(0, "rgba(255, 255, 255, 0.9)");
    glow.addColorStop(1, "rgba(255, 255, 255, 0)");
    context.fillStyle = glow;
    context.fillRect(pulseX - 26, lineY - 26, 52, 52);

    const step = (right - left) / (CAREER.length - 1);
    CAREER.forEach((entry, index) => {
      const x = left + index * step;
      const above = index % 2 === 0;
      const last = index === CAREER.length - 1;
      context.strokeStyle = "rgba(169, 164, 255, 0.5)";
      context.lineWidth = 1.5;
      context.beginPath();
      context.moveTo(x, lineY);
      context.lineTo(x, above ? lineY - 34 : lineY + 34);
      context.stroke();

      context.fillStyle =
        last && Math.floor(time * 2) % 2 === 0
          ? "#ffffff"
          : last
            ? TEAL
            : PURPLE;
      context.beginPath();
      context.arc(x, lineY, last ? 8 : 6, 0, Math.PI * 2);
      context.fill();

      context.textAlign = "center";
      context.fillStyle = "#8e8aad";
      context.font = `500 12px ${MONO}`;
      context.fillText(entry.years, x, above ? lineY + 24 : lineY - 16);
      context.fillStyle = "#ffffff";
      context.font = `700 15px ${SANS}`;
      context.fillText(
        entry.title,
        x,
        above ? lineY - 58 : lineY + 56,
        step * 1.6,
      );
      context.fillStyle = "#c9c5ff";
      context.font = `400 12px ${SANS}`;
      context.fillText(
        entry.detail,
        x,
        above ? lineY - 41 : lineY + 73,
        step * 1.6,
      );
    });
    context.textAlign = "left";
  };
  return <AnimatedPanel {...props} draw={draw} />;
};

const TechWalls: React.FC = () => (
  <group>
    {/* Back wall, either side of the projection: where I have worked */}
    <MapPanel position={[-3.75, 1.65, -4.97]} size={[2.3, 1.4]} />
    <TimelinePanel position={[3.75, 1.65, -4.97]} size={[2.3, 1.4]} />
    {/* Wall behind the entrance */}
    <NetworkPanel
      position={[3.7, 1.6, 4.97]}
      rotationY={Math.PI}
      size={[2.3, 1.4]}
    />
    <RainPanel
      position={[0, 1.6, 4.97]}
      rotationY={Math.PI}
      size={[2.3, 1.4]}
    />
    <TerminalPanel
      position={[-3.7, 1.6, 4.97]}
      rotationY={Math.PI}
      size={[2.3, 1.4]}
    />

    {/* Ceiling track with spotlights on each station */}
    <mesh position={[0, 3.17, -1]}>
      <boxGeometry args={[9, 0.04, 0.06]} />
      <meshStandardMaterial color="#1c1c28" metalness={0.5} />
    </mesh>
    <Spot
      position={[0, 3.08, -1]}
      target={[0, 0.9, -1.8]}
      intensity={10}
      bootDelay={0.9}
    />
    <Spot
      position={[-3.6, 3.08, -1]}
      target={[-5.3, 1.1, -0.9]}
      color="#a9c8ff"
      bootDelay={1.05}
    />
    <Spot
      position={[3.6, 3.08, -1]}
      target={[5.6, 1.0, -1.2]}
      color="#e3c9ff"
      bootDelay={1.2}
    />
  </group>
);

export default TechWalls;
