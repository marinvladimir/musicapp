import React, { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Euler,
  Group,
  Quaternion,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  Vector3,
} from "three";
import { useStore } from "../store";
import { togglePlayback } from "../audio/player";
import { analysis } from "../audio/analysis";
import {
  DROP_SECONDS,
  EJECT_SECONDS,
  EMERGE_SECONDS,
  FLY_SECONDS,
  bookPositions,
  isRecordOnPlatter,
  secondsSince,
  transfer,
} from "../audio/recordTransfer";
import Interactive from "./Interactive";
import Model from "./Model";
import { coverUrl } from "../utils";

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

const RecordDisc: React.FC<{ label: Texture | null }> = ({ label }) => (
  <>
    <mesh>
      <cylinderGeometry args={[0.152, 0.152, 0.006, 48]} />
      <meshStandardMaterial color="#0c0c10" roughness={0.35} metalness={0.2} />
    </mesh>
    <mesh position={[0, 0.0035, 0]} rotation-x={-Math.PI / 2}>
      <circleGeometry args={[0.052, 32]} />
      <meshStandardMaterial map={label} color={label ? "#ffffff" : "#6c63ff"} />
    </mesh>
  </>
);

const smooth = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};

const bezier = (
  a: Vector3,
  control: Vector3,
  b: Vector3,
  t: number,
  out: Vector3,
) =>
  out
    .copy(a)
    .multiplyScalar((1 - t) * (1 - t))
    .addScaledVector(control, 2 * (1 - t) * t)
    .addScaledVector(b, t * t);

// A record standing in a book faces the room (-x); on the platter it lies flat.
const STANDING = new Quaternion().setFromEuler(new Euler(0, 0, Math.PI / 2));
const FLAT = new Quaternion();
const FALLBACK_BOOK = new Vector3(5.5, 1.5, -1.3);
const OUT_OF_BOOK = new Vector3(-0.32, 0, 0);

// The records travelling between the shelf and the turntable.
const FlyingRecords: React.FC<{
  anchor: React.RefObject<Group>;
  incomingLabel: Texture | null;
  outgoingLabel: Texture | null;
}> = ({ anchor, incomingLabel, outgoingLabel }) => {
  const incoming = useRef<Group>(null);
  const outgoing = useRef<Group>(null);
  const points = useRef({
    platter: new Vector3(),
    above: new Vector3(),
    bookIn: new Vector3(),
    bookOut: new Vector3(),
    control: new Vector3(),
  });

  const placeBetween = (album: string) => {
    const p = points.current;
    anchor.current?.getWorldPosition(p.platter);
    p.above.copy(p.platter).add(new Vector3(0, 0.35, 0));
    p.bookIn.copy(bookPositions.get(album) ?? FALLBACK_BOOK);
    p.bookOut.copy(p.bookIn).add(OUT_OF_BOOK);
    p.control
      .copy(p.bookOut)
      .lerp(p.above, 0.5)
      .add(new Vector3(0, 0.6, 0));
  };

  useFrame(() => {
    const current = transfer.current;
    const p = points.current;

    if (outgoing.current) {
      const elapsed = current?.outgoing ? secondsSince(current.startedAt) : -1;
      const active =
        !!current?.outgoing && elapsed >= 0 && elapsed < EJECT_SECONDS;
      outgoing.current.visible = active;
      if (active && current?.outgoing) {
        placeBetween(current.outgoing.album);
        const u = elapsed / EJECT_SECONDS;
        if (u < 0.3) {
          outgoing.current.position.lerpVectors(
            p.platter,
            p.above,
            smooth(u / 0.3),
          );
          outgoing.current.quaternion.copy(FLAT);
        } else {
          const v = smooth((u - 0.3) / 0.7);
          bezier(p.above, p.control, p.bookOut, v, outgoing.current.position);
          outgoing.current.quaternion.slerpQuaternions(FLAT, STANDING, v);
        }
      }
    }

    if (incoming.current) {
      const elapsed = current ? secondsSince(current.incomingAt) : -1;
      const total = EMERGE_SECONDS + FLY_SECONDS + DROP_SECONDS;
      const active = !!current && elapsed >= 0 && elapsed < total;
      incoming.current.visible = active;
      if (active && current) {
        placeBetween(current.incoming.album);
        const target = incoming.current;
        if (elapsed < EMERGE_SECONDS) {
          target.position.lerpVectors(
            p.bookIn,
            p.bookOut,
            smooth(elapsed / EMERGE_SECONDS),
          );
          target.quaternion.copy(STANDING);
        } else if (elapsed < EMERGE_SECONDS + FLY_SECONDS) {
          const u = smooth((elapsed - EMERGE_SECONDS) / FLY_SECONDS);
          bezier(p.bookOut, p.control, p.above, u, target.position);
          target.quaternion.slerpQuaternions(STANDING, FLAT, u);
        } else {
          const u = smooth(
            (elapsed - EMERGE_SECONDS - FLY_SECONDS) / DROP_SECONDS,
          );
          target.position.lerpVectors(p.above, p.platter, u);
          target.quaternion.copy(FLAT);
        }
      }
    }
  });

  return (
    <>
      <group ref={incoming} visible={false}>
        <RecordDisc label={incomingLabel} />
      </group>
      <group ref={outgoing} visible={false}>
        <RecordDisc label={outgoingLabel} />
      </group>
    </>
  );
};

const Speaker: React.FC<{ position: [number, number, number] }> = ({
  position,
}) => {
  const group = useRef<Group>(null);
  // The speaker pumps a little with the loudness of the music.
  useFrame(() => {
    group.current?.scale.setScalar(1 + analysis.level * 0.03);
  });
  return (
    <group ref={group} position={position}>
      <Model url="/assets/models/speaker.glb" height={0.42} />
    </group>
  );
};

const Turntable3D: React.FC = () => {
  const record = useRef<Group>(null);
  const arm = useRef<Group>(null);
  const currentSong = useStore((state) => state.currentSong);
  const goTo = useStore((state) => state.goTo);
  // The record's label is the album cover: one record per album.
  const label = useLabelTexture(
    currentSong ? coverUrl(currentSong.album) : null,
  );
  const platterAnchor = useRef<Group>(null);
  // The song that was on the turntable before, for the record going back.
  const [previousSong, setPreviousSong] = useState(currentSong);
  const lastSong = useRef(currentSong);
  useEffect(() => {
    if (lastSong.current?.album === currentSong?.album) return;
    setPreviousSong(lastSong.current);
    lastSong.current = currentSong;
  }, [currentSong]);
  const previousLabel = useLabelTexture(
    previousSong ? coverUrl(previousSong.album) : null,
  );

  useFrame((_, delta) => {
    const { isPlaying } = useStore.getState();
    // While a record is on its way, the platter stays empty and still.
    const onPlatter = isRecordOnPlatter();
    const spinning = isPlaying && onPlatter;
    if (record.current) {
      record.current.visible = onPlatter;
      if (spinning) record.current.rotation.y -= RECORD_SPEED * delta;
    }
    if (arm.current) {
      const target = spinning ? ARM_ON_RECORD : ARM_REST;
      arm.current.rotation.y +=
        (target - arm.current.rotation.y) * Math.min(1, delta * 4);
    }
  });

  return (
    <>
      {/* Built facing +z, then turned to face the room from the right wall. */}
      <group position={[5.62, 0, 1.4]} rotation-y={-Math.PI / 2}>
        {/* Wooden sideboard (Meshy model) the turntable stands on */}
        <Model url="/assets/models/credenza.glb" width={1.45} />

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

              <group ref={platterAnchor} position={[-0.05, 0.103, 0]} />
              {currentSong && (
                <group ref={record} position={[-0.05, 0.103, 0]}>
                  <RecordDisc label={label} />
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
      <FlyingRecords
        anchor={platterAnchor}
        incomingLabel={label}
        outgoingLabel={previousLabel}
      />
    </>
  );
};

export default Turntable3D;
