import React from "react";
import { DoubleSide } from "three";
import { useStore } from "../store";
import { experience, profile } from "../data/cv";
import Interactive from "./Interactive";
import Sign from "./Sign";
import {
  SANS,
  loadImage,
  roundRect,
  useCanvasTexture,
  wrapText,
} from "./textures";

const PAPER_W = 1024;
const PAPER_H = 1448;

// A miniature of the CV printed on the paper. The full, readable version opens
// in the CV panel.
const drawCv = async (context: CanvasRenderingContext2D) => {
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, PAPER_W, PAPER_H);

  context.fillStyle = "#12122a";
  context.fillRect(0, 0, PAPER_W, 330);
  const band = context.createLinearGradient(0, 0, PAPER_W, 0);
  band.addColorStop(0, "#6c63ff");
  band.addColorStop(1, "#4fd1c5");
  context.fillStyle = band;
  context.fillRect(0, 330, PAPER_W, 10);

  context.fillStyle = "#ffffff";
  context.font = `700 76px ${SANS}`;
  context.fillText(profile.name, 64, 130);
  context.fillStyle = "#a9a4ff";
  context.font = `500 38px ${SANS}`;
  context.fillText(profile.title, 64, 190);
  context.fillStyle = "#c9c9dd";
  context.font = `400 26px ${SANS}`;
  context.fillText(profile.stack, 64, 240);
  context.fillText(
    `${profile.email}  ·  ${profile.phone}  ·  ${profile.location}`,
    64,
    284,
  );

  try {
    const photo = await loadImage(profile.photo);
    context.save();
    context.beginPath();
    context.arc(860, 165, 110, 0, Math.PI * 2);
    context.clip();
    context.drawImage(photo, 750, 55, 220, 220);
    context.restore();
  } catch {
    // The paper still reads fine without the photo.
  }

  const section = (title: string, y: number) => {
    context.fillStyle = "#6c63ff";
    context.font = `700 26px ${SANS}`;
    context.fillText(title, 64, y);
    context.fillStyle = "#e3e1f5";
    context.fillRect(64 + context.measureText(title).width + 40, y - 9, 700, 2);
  };

  section("PROFILE", 410);
  context.fillStyle = "#33334a";
  context.font = `400 25px ${SANS}`;
  let y = wrapText(context, profile.summary, 64, 456, PAPER_W - 128, 36, 5);

  y += 12;
  profile.highlights.forEach((item, index) => {
    const x = 64 + index * 304;
    context.fillStyle = "#efeeff";
    roundRect(context, x, y, 288, 120, 14);
    context.fill();
    context.fillStyle = "#1d1d3a";
    context.font = `700 26px ${SANS}`;
    context.fillText(item.title, x + 20, y + 44);
    context.fillStyle = "#55556e";
    context.font = `400 19px ${SANS}`;
    wrapText(context, item.text, x + 20, y + 76, 250, 24, 2);
  });

  y += 190;
  section("EXPERIENCE", y);
  y += 54;
  for (const job of experience.slice(0, 3)) {
    context.fillStyle = "#4b43d6";
    context.font = `700 28px ${SANS}`;
    context.fillText(job.company, 64, y);
    context.fillStyle = "#6b6b82";
    context.font = `500 22px ${SANS}`;
    const period = context.measureText(job.period).width;
    context.fillText(job.period, PAPER_W - 64 - period, y);
    context.fillStyle = "#1d1d3a";
    context.font = `500 24px ${SANS}`;
    context.fillText(job.role, 64, y + 36);
    y += 76;
    context.fillStyle = "#44445c";
    context.font = `400 21px ${SANS}`;
    for (const bullet of job.bullets.slice(0, 2)) {
      context.fillStyle = "#6c63ff";
      context.fillRect(70, y - 8, 7, 7);
      context.fillStyle = "#44445c";
      y = wrapText(context, bullet, 92, y, PAPER_W - 160, 29, 2) + 6;
    }
    y += 28;
  }

  context.fillStyle = "#6c63ff";
  context.font = `700 30px ${SANS}`;
  const hint = "Click to open the full CV";
  context.fillText(
    hint,
    (PAPER_W - context.measureText(hint).width) / 2,
    PAPER_H - 60,
  );
};

const PhotoFrame: React.FC = () => {
  const texture = useCanvasTexture(256, 256, async (context) => {
    const photo = await loadImage(profile.photo);
    context.drawImage(photo, 0, 0, 256, 256);
  });
  return (
    <group position={[-0.68, 0.78, -1.82]} rotation={[0, 0.45, 0]}>
      <mesh position={[0, 0.11, 0]} rotation-x={-0.15}>
        <boxGeometry args={[0.2, 0.24, 0.02]} />
        <meshStandardMaterial color="#1a1a28" />
      </mesh>
      <mesh position={[0, 0.11, 0.011]} rotation-x={-0.15}>
        <planeGeometry args={[0.16, 0.2]} />
        <meshStandardMaterial map={texture} roughness={0.5} />
      </mesh>
    </group>
  );
};

const Lamp: React.FC = () => (
  <group position={[0.72, 0.78, -1.9]}>
    <mesh position={[0, 0.015, 0]}>
      <cylinderGeometry args={[0.09, 0.1, 0.03, 20]} />
      <meshStandardMaterial color="#e8e6ff" metalness={0.3} roughness={0.4} />
    </mesh>
    <mesh position={[0, 0.25, 0]}>
      <cylinderGeometry args={[0.012, 0.012, 0.48, 8]} />
      <meshStandardMaterial color="#e8e6ff" metalness={0.4} />
    </mesh>
    <mesh position={[-0.08, 0.48, 0.05]} rotation={[0.4, 0, 0.6]}>
      <coneGeometry args={[0.1, 0.14, 20, 1, true]} />
      <meshStandardMaterial color="#6c63ff" side={DoubleSide} />
    </mesh>
    <pointLight
      position={[-0.12, 0.42, 0.1]}
      intensity={2.2}
      distance={2.5}
      color="#ffd59a"
    />
  </group>
);

const CvDesk: React.FC = () => {
  const goTo = useStore((state) => state.goTo);
  const paper = useCanvasTexture(PAPER_W, PAPER_H, drawCv);

  return (
    <group>
      {/* Desk */}
      <mesh position={[0, 0.75, -1.8]}>
        <boxGeometry args={[1.9, 0.06, 0.9]} />
        <meshStandardMaterial color="#e8e6ff" roughness={0.5} />
      </mesh>
      {[-0.85, 0.85].map((x) => (
        <mesh key={x} position={[x, 0.36, -1.8]}>
          <boxGeometry args={[0.06, 0.72, 0.8]} />
          <meshStandardMaterial color="#6c63ff" roughness={0.4} />
        </mesh>
      ))}

      {/* Chair behind the desk */}
      <group position={[0, 0, -2.55]}>
        <mesh position={[0, 0.48, 0]}>
          <boxGeometry args={[0.5, 0.08, 0.48]} />
          <meshStandardMaterial color="#3a3266" />
        </mesh>
        <mesh position={[0, 0.85, -0.22]}>
          <boxGeometry args={[0.5, 0.65, 0.06]} />
          <meshStandardMaterial color="#3a3266" />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.44, 8]} />
          <meshStandardMaterial color="#888" metalness={0.6} />
        </mesh>
      </group>

      <Interactive label="Read my CV" onSelect={() => goTo("cv")}>
        {(hovered) => (
          <group position={[0, 1.08, -1.82]} rotation-x={-0.42}>
            {/* Stand behind the paper */}
            <mesh position={[0, 0, -0.015]}>
              <boxGeometry args={[0.6, 0.8, 0.02]} />
              <meshStandardMaterial color="#1a1a28" />
            </mesh>
            <mesh>
              <planeGeometry args={[0.52, 0.735]} />
              <meshStandardMaterial
                map={paper}
                roughness={0.7}
                emissive="#ffffff"
                emissiveMap={paper}
                emissiveIntensity={hovered ? 0.3 : 0.04}
              />
            </mesh>
          </group>
        )}
      </Interactive>

      <PhotoFrame />
      <Lamp />
      <mesh position={[0.45, 0.83, -1.55]}>
        <cylinderGeometry args={[0.04, 0.035, 0.1, 16]} />
        <meshStandardMaterial color="#4fd1c5" />
      </mesh>

      <mesh position={[0, 0.5, -1.38]}>
        <boxGeometry args={[1.6, 0.42, 0.03]} />
        <meshStandardMaterial color="#25253c" roughness={0.6} />
      </mesh>
      <Sign
        text="CV"
        position={[0, 0.52, -1.355]}
        color="#4fd1c5"
        floating={false}
      />
    </group>
  );
};

export default CvDesk;
