import React, { useEffect, useMemo, useState } from "react";
import {
  Box3,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Vector3,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { trackLoading } from "../loading";

const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const cache = new Map<string, Promise<Group>>();

const loadModel = (url: string) => {
  if (!cache.has(url)) {
    cache.set(
      url,
      trackLoading(loader.loadAsync(url).then((gltf) => gltf.scene)),
    );
  }
  return cache.get(url)!;
};

// A 3D model from public/assets/models, scaled to a given height (or width)
// with its base on the ground and its middle at the origin, so it can be
// placed like the room's own furniture.
const Model: React.FC<{
  url: string;
  height?: number;
  width?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  // Multiplies the model's colours, to tone down a model that looks too
  // bright in the room's light.
  brightness?: number;
}> = ({
  url,
  height,
  width,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  brightness = 1,
}) => {
  const [source, setSource] = useState<Group | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadModel(url)
      .then((scene) => !cancelled && setSource(scene))
      .catch((error) => console.error(`Failed to load ${url}:`, error));
    return () => {
      cancelled = true;
    };
  }, [url]);

  const placed = useMemo(() => {
    if (!source) return null;
    const object: Object3D = source.clone(true);
    const box = new Box3().setFromObject(object);
    const size = box.getSize(new Vector3());
    const scale = height ? height / size.y : width ? width / size.x : 1;
    const center = box.getCenter(new Vector3());
    object.position.set(
      -center.x * scale,
      -box.min.y * scale,
      -center.z * scale,
    );
    object.scale.setScalar(scale);
    if (brightness !== 1) {
      object.traverse((child) => {
        const mesh = child as Mesh;
        if (!mesh.isMesh) return;
        const material = (mesh.material as MeshStandardMaterial).clone();
        material.color.multiplyScalar(brightness);
        mesh.material = material;
      });
    }
    return object;
  }, [source, height, width, brightness]);

  if (!placed) return null;
  return (
    <group position={position} rotation={rotation}>
      <primitive object={placed} />
    </group>
  );
};

export default Model;
