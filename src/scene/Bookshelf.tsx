import React, { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MeshStandardMaterial, Vector3 } from "three";
import { useStore } from "../store";
import { Album } from "../types";
import Interactive from "./Interactive";
import Sign from "./Sign";
import { Plant } from "./Room";
import { bookPositions } from "../audio/recordTransfer";
import { albumTitle, coverUrl } from "../utils";
import { SANS, loadImage, useCanvasTexture } from "./textures";

const SHELF_WIDTH = 1.9;
const SHELF_DEPTH = 0.36;
const BOARD_HEIGHTS = [0.12, 0.66, 1.2, 1.74, 2.28];
const BOOK = { thickness: 0.15, height: 0.44, depth: 0.28 };
const BOOKS_PER_ROW = 5;
const SPINE_W = 192;
const SPINE_H = 564;

const averageColor = (image: HTMLImageElement) => {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const context = canvas.getContext("2d")!;
  context.drawImage(image, 0, 0, 1, 1);
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
  // Darken it so the white title stays readable.
  return `rgb(${r * 0.45}, ${g * 0.45}, ${b * 0.45})`;
};

const Book: React.FC<{ album: Album; position: [number, number, number] }> = ({
  album,
  position,
}) => {
  const group = useRef<Group>(null);
  const anchor = useRef<Group>(null);
  // The turntable flies records to and from this spot.
  useEffect(() => {
    if (!anchor.current) return;
    const position = new Vector3();
    anchor.current.getWorldPosition(position);
    bookPositions.set(album.albumName, position);
  }, [album.albumName]);
  const selected = useStore((state) => state.selectedAlbum === album.albumName);
  const { selectAlbum, goTo, panel } = useStore();

  const spine = useCanvasTexture(SPINE_W, SPINE_H, async (context) => {
    const cover = await loadImage(coverUrl(album.albumName));
    context.fillStyle = averageColor(cover);
    context.fillRect(0, 0, SPINE_W, SPINE_H);
    context.drawImage(cover, 12, 12, SPINE_W - 24, SPINE_W - 24);
    context.save();
    context.translate(SPINE_W / 2, SPINE_W + 18);
    context.rotate(Math.PI / 2);
    context.fillStyle = "#ffffff";
    context.font = `700 40px ${SANS}`;
    context.textBaseline = "middle";
    context.fillText(albumTitle(album.albumName), 0, 0, SPINE_H - SPINE_W - 70);
    context.restore();
    context.fillStyle = "rgba(255, 255, 255, 0.6)";
    context.font = `500 26px ${SANS}`;
    context.textAlign = "center";
    context.fillText("MV", SPINE_W / 2, SPINE_H - 22);
  });

  const materials = useMemo(() => {
    const plain = new MeshStandardMaterial({
      color: "#2a2440",
      roughness: 0.8,
    });
    const front = new MeshStandardMaterial({
      map: spine,
      roughness: 0.6,
      emissive: "#ffffff",
      emissiveMap: spine,
      emissiveIntensity: 0,
    });
    // Box faces are ordered +x, -x, +y, -y, +z, -z; the spine faces +z.
    return [plain, plain, plain, plain, front, plain];
  }, [spine]);

  const hovered = useRef(false);

  // Hovered and selected books slide out of the shelf.
  useFrame((_, delta) => {
    if (!group.current) return;
    const target = selected ? 0.14 : hovered.current ? 0.07 : 0;
    group.current.position.z +=
      (target - group.current.position.z) * Math.min(1, delta * 10);
    (materials[4] as MeshStandardMaterial).emissiveIntensity = selected
      ? 0.25
      : 0;
  });

  return (
    <group ref={anchor} position={position}>
      <group ref={group}>
        <Interactive
          label={`Listen to ${albumTitle(album.albumName)}`}
          onSelect={() => {
            selectAlbum(album.albumName);
            if (panel !== "music") goTo("music");
          }}
          onHoverChange={(value) => (hovered.current = value)}
        >
          {() => (
            <mesh material={materials}>
              <boxGeometry args={[BOOK.thickness, BOOK.height, BOOK.depth]} />
            </mesh>
          )}
        </Interactive>
      </group>
    </group>
  );
};

const VinylStack: React.FC<{ position: [number, number, number] }> = ({
  position,
}) => (
  <group position={position}>
    {[0, 1, 2, 3, 4].map((index) => (
      <mesh key={index} position={[index * 0.05, 0.16, 0]} rotation-z={-0.12}>
        <boxGeometry args={[0.012, 0.31, 0.31]} />
        <meshStandardMaterial
          color={["#6c63ff", "#b56cff", "#4fd1c5", "#ff8fab", "#ffc46b"][index]}
        />
      </mesh>
    ))}
  </group>
);

const Bookshelf: React.FC = () => {
  const albums = useStore((state) => state.albums);
  const rows = Math.ceil(albums.length / BOOKS_PER_ROW);

  return (
    // Built facing +z, then turned to face the room from the right wall.
    <group position={[5.78, 0, -1.3]} rotation-y={-Math.PI / 2}>
      <mesh position={[0, 1.2, -SHELF_DEPTH / 2]}>
        <boxGeometry args={[SHELF_WIDTH, 2.4, 0.03]} />
        <meshStandardMaterial color="#1c1830" />
      </mesh>
      {[-SHELF_WIDTH / 2, SHELF_WIDTH / 2].map((x) => (
        <mesh key={x} position={[x, 1.2, 0]}>
          <boxGeometry args={[0.05, 2.4, SHELF_DEPTH]} />
          <meshStandardMaterial color="#e8e6ff" roughness={0.5} />
        </mesh>
      ))}
      {BOARD_HEIGHTS.map((y) => (
        <mesh key={y} position={[0, y - 0.02, 0]}>
          <boxGeometry args={[SHELF_WIDTH, 0.04, SHELF_DEPTH]} />
          <meshStandardMaterial color="#e8e6ff" roughness={0.5} />
        </mesh>
      ))}

      {albums.map((album, index) => {
        const row = Math.floor(index / BOOKS_PER_ROW);
        const column = index % BOOKS_PER_ROW;
        const x = -SHELF_WIDTH / 2 + 0.14 + column * (BOOK.thickness + 0.015);
        // Fill from the top shelf down, so the first albums are at eye height.
        const y = BOARD_HEIGHTS[rows - row] + BOOK.height / 2;
        return (
          <Book
            key={album.albumName}
            album={album}
            position={[x, y, SHELF_DEPTH / 2 - BOOK.depth / 2 - 0.01]}
          />
        );
      })}

      {/* Decoration in the space next to the books on each shelf */}
      <Plant position={[0.55, BOARD_HEIGHTS[3], 0]} scale={0.45} />
      <VinylStack position={[0.4, BOARD_HEIGHTS[2], -0.02]} />
      <Plant position={[0.6, BOARD_HEIGHTS[1], 0]} scale={0.35} />
      <VinylStack position={[-0.6, BOARD_HEIGHTS[0], -0.02]} />
      <VinylStack position={[0.3, BOARD_HEIGHTS[0], -0.02]} />
      <pointLight
        position={[0, 2.2, 0.7]}
        intensity={3}
        distance={3.5}
        color="#b56cff"
      />
      <Sign text="MUSIC" position={[0, 2.62, 0.1]} />
    </group>
  );
};

export default Bookshelf;
