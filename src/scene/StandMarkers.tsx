import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, Group } from "three";
import { STATION_ORDER, Station, useStore } from "../store";
import { STAND_MARKERS } from "./layout";
import Interactive from "./Interactive";
import { neon } from "./neon";
import { bootLevel } from "../boot";

const LABELS: Record<Station, string> = {
  cv: "Go to the desk: my CV",
  projects: "Go to the TV: my projects",
  music: "Go to the shelf: my music",
};

// Pulsing ring on the floor that marks where to stand for a station.
const Marker: React.FC<{ station: Station }> = ({ station }) => {
  const ring = useRef<Group>(null);
  const goTo = useStore((state) => state.goTo);
  const here = useStore(
    (state) => state.location === station && !state.flyTarget,
  );
  const [x, z] = STAND_MARKERS[station];

  useFrame(({ clock }) => {
    if (!ring.current) return;
    // The rings appear once the room has switched on.
    if (ring.current.parent) ring.current.parent.visible = bootLevel(2.2) > 0;
    const pulse = (clock.elapsedTime * 0.8 + x) % 1;
    ring.current.scale.setScalar(1 + pulse * 0.5);
    ring.current.children.forEach((child, index) => {
      const material = (child as unknown as { material: { opacity: number } })
        .material;
      material.opacity = index === 0 ? 1 - pulse : 0.9;
    });
  });

  if (here) return null;

  return (
    <Interactive label={LABELS[station]} onSelect={() => goTo(station)}>
      {(hovered) => (
        <group position={[x, 0.02, z]} rotation-x={-Math.PI / 2}>
          <group ref={ring}>
            <mesh>
              <ringGeometry args={[0.36, 0.42, 48]} />
              <meshBasicMaterial
                color={neon("#4fd1c5", 2)}
                transparent
                blending={AdditiveBlending}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
          </group>
          <mesh>
            <ringGeometry args={[0.22, 0.27, 48]} />
            <meshBasicMaterial
              color={neon(hovered ? "#ffffff" : "#6c63ff", 2.5)}
              toneMapped={false}
            />
          </mesh>
          {/* Larger invisible disc, easier to click than the thin rings */}
          <mesh>
            <circleGeometry args={[0.5, 24]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        </group>
      )}
    </Interactive>
  );
};

const StandMarkers: React.FC = () => (
  <>
    {STATION_ORDER.map((station) => (
      <Marker key={station} station={station} />
    ))}
  </>
);

export default StandMarkers;
