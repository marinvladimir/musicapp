import React, { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Mesh, SRGBColorSpace, Texture, TextureLoader } from "three";
import { useStore } from "../store";
import { togglePlayback } from "../audio/player";
import { analysis } from "../audio/analysis";
import Interactive from "./Interactive";

// 33⅓ revolutions per minute, in radians per second.
const RECORD_SPEED = (33.333 / 60) * Math.PI * 2;
const ARM_REST = 0;
const ARM_ON_RECORD = 0.42;

const useLabelTexture = (url: string | null | undefined) => {
  const [texture, setTexture] = useState<Texture | null>(null);
  useEffect(() => {
    if (!url) {
      setTexture(null);
      return;
    }
    let cancelled = false;
    new TextureLoader().load(url, (loaded) => {
      loaded.colorSpace = SRGBColorSpace;
      if (cancelled) loaded.dispose();
      else setTexture(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [url]);
  useEffect(() => () => texture?.dispose(), [texture]);
  return texture;
};

const Speaker: React.FC<{ position: [number, number, number] }> = ({
  position,
}) => {
  const woofer = useRef<Mesh>(null);
  // The woofer pumps with the loudness of the music.
  useFrame(() => {
    if (woofer.current)
      woofer.current.scale.setScalar(1 + analysis.level * 0.12);
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.24, 0.4, 0.24]} />
        <meshStandardMaterial color="#15151f" roughness={0.4} />
      </mesh>
      <mesh ref={woofer} position={[0, 0.15, 0.121]}>
        <circleGeometry args={[0.07, 24]} />
        <meshStandardMaterial color="#3a3a55" metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.31, 0.121]}>
        <circleGeometry args={[0.03, 20]} />
        <meshStandardMaterial color="#6c63ff" />
      </mesh>
    </group>
  );
};

const Turntable3D: React.FC = () => {
  const record = useRef<Group>(null);
  const arm = useRef<Group>(null);
  const currentSong = useStore((state) => state.currentSong);
  const goTo = useStore((state) => state.goTo);
  const label = useLabelTexture(currentSong?.imageUrl);

  useFrame((_, delta) => {
    const { isPlaying } = useStore.getState();
    if (record.current && isPlaying)
      record.current.rotation.y -= RECORD_SPEED * delta;
    if (arm.current) {
      const target = isPlaying ? ARM_ON_RECORD : ARM_REST;
      arm.current.rotation.y +=
        (target - arm.current.rotation.y) * Math.min(1, delta * 4);
    }
  });

  return (
    // Built facing +z, then turned to face the room from the right wall.
    <group position={[5.62, 0, 1.4]} rotation-y={-Math.PI / 2}>
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[1.4, 0.64, 0.46]} />
        <meshStandardMaterial color="#e8e6ff" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.32, 0.231]}>
        <planeGeometry args={[1.3, 0.02]} />
        <meshBasicMaterial color="#6c63ff" toneMapped={false} />
      </mesh>

      <Speaker position={[-0.55, 0.64, 0]} />
      <Speaker position={[0.55, 0.64, 0]} />

      <Interactive
        label={
          currentSong
            ? "Play / pause the record"
            : "Pick a record from the shelf"
        }
        onSelect={() => (currentSong ? togglePlayback() : goTo("music"))}
      >
        {(hovered) => (
          <group position={[0, 0.64, 0]}>
            <mesh position={[0, 0.04, 0]}>
              <boxGeometry args={[0.5, 0.08, 0.38]} />
              <meshStandardMaterial
                color={hovered ? "#3a3266" : "#22222f"}
                roughness={0.4}
              />
            </mesh>
            <mesh position={[-0.05, 0.09, 0]}>
              <cylinderGeometry args={[0.16, 0.16, 0.02, 48]} />
              <meshStandardMaterial
                color="#8c8ca3"
                metalness={0.7}
                roughness={0.3}
              />
            </mesh>

            {currentSong && (
              <group ref={record} position={[-0.05, 0.103, 0]}>
                <mesh>
                  <cylinderGeometry args={[0.152, 0.152, 0.006, 48]} />
                  <meshStandardMaterial
                    color="#0c0c10"
                    roughness={0.35}
                    metalness={0.2}
                  />
                </mesh>
                <mesh position={[0, 0.0035, 0]} rotation-x={-Math.PI / 2}>
                  <circleGeometry args={[0.052, 32]} />
                  <meshStandardMaterial
                    map={label}
                    color={label ? "#ffffff" : "#6c63ff"}
                  />
                </mesh>
              </group>
            )}

            {/* Tonearm, pivoting at the back right of the deck */}
            <group position={[0.18, 0.1, -0.13]}>
              <mesh>
                <cylinderGeometry args={[0.025, 0.03, 0.04, 16]} />
                <meshStandardMaterial color="#e8e6ff" metalness={0.5} />
              </mesh>
              <group ref={arm} position={[0, 0.035, 0]}>
                <mesh position={[0, 0, 0.12]}>
                  <boxGeometry args={[0.012, 0.012, 0.26]} />
                  <meshStandardMaterial
                    color="#e8e6ff"
                    metalness={0.6}
                    roughness={0.3}
                  />
                </mesh>
                <mesh position={[-0.01, -0.01, 0.255]}>
                  <boxGeometry args={[0.03, 0.015, 0.04]} />
                  <meshStandardMaterial color="#6c63ff" />
                </mesh>
              </group>
            </group>

            <mesh position={[-0.2, 0.081, 0.16]} rotation-x={-Math.PI / 2}>
              <circleGeometry args={[0.012, 16]} />
              <meshBasicMaterial
                color={currentSong ? "#4fd1c5" : "#55556e"}
                toneMapped={false}
              />
            </mesh>
          </group>
        )}
      </Interactive>
    </group>
  );
};

export default Turntable3D;
