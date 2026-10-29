import React, { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Euler, Matrix4, Quaternion, Vector3 } from "three";
import { useStore } from "../store";
import {
  OBSTACLES,
  ROOM,
  START_LOOK_AT,
  START_POSITION,
  STATIONS,
} from "./layout";

const WALK_SPEED = 2.2; // metres per second
const RUN_MULTIPLIER = 1.8;
const LOOK_SPEED = 0.004; // radians per dragged pixel
const MAX_PITCH = 1.1;
const FLY_SECONDS = 1.2;
const WALL_MARGIN = 0.4;
const OBSTACLE_MARGIN = 0.3;

const KEYS: Record<string, "forward" | "back" | "left" | "right"> = {
  KeyW: "forward",
  ArrowUp: "forward",
  KeyS: "back",
  ArrowDown: "back",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
};

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const isBlocked = (x: number, z: number) => {
  const limitX = ROOM.width / 2 - WALL_MARGIN;
  const limitZ = ROOM.depth / 2 - WALL_MARGIN;
  if (Math.abs(x) > limitX || Math.abs(z) > limitZ) return true;
  return OBSTACLES.some(
    (box) =>
      x > box.minX - OBSTACLE_MARGIN &&
      x < box.maxX + OBSTACLE_MARGIN &&
      z > box.minZ - OBSTACLE_MARGIN &&
      z < box.maxZ + OBSTACLE_MARGIN,
  );
};

const lookRotation = (from: Vector3, to: Vector3) =>
  new Quaternion().setFromRotationMatrix(
    new Matrix4().lookAt(from, to, new Vector3(0, 1, 0)),
  );

// First-person camera: drag to look around, WASD / arrow keys (or the touch
// pad) to walk, and a smooth flight when a station is chosen.
const CameraRig: React.FC = () => {
  const { camera, gl } = useThree();
  const yaw = useRef(0);
  const pitch = useRef(0);
  const keys = useRef({
    forward: false,
    back: false,
    left: false,
    right: false,
    run: false,
  });
  const flight = useRef<{
    fromPosition: Vector3;
    toPosition: Vector3;
    fromRotation: Quaternion;
    toRotation: Quaternion;
    progress: number;
  } | null>(null);
  const flyTarget = useStore((state) => state.flyTarget);
  const arrive = useStore((state) => state.arrive);

  const syncAnglesFromCamera = () => {
    const euler = new Euler().setFromQuaternion(camera.quaternion, "YXZ");
    yaw.current = euler.y;
    pitch.current = euler.x;
  };

  useEffect(() => {
    camera.position.set(...START_POSITION);
    camera.lookAt(...START_LOOK_AT);
    syncAnglesFromCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera]);

  useEffect(() => {
    if (!flyTarget) return;
    const station = STATIONS[flyTarget];
    const toPosition = new Vector3(...station.position);
    const toRotation = lookRotation(toPosition, new Vector3(...station.lookAt));
    if (prefersReducedMotion()) {
      camera.position.copy(toPosition);
      camera.quaternion.copy(toRotation);
      syncAnglesFromCamera();
      arrive();
      return;
    }
    flight.current = {
      fromPosition: camera.position.clone(),
      toPosition,
      fromRotation: camera.quaternion.clone(),
      toRotation,
      progress: 0,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyTarget, camera, arrive]);

  useEffect(() => {
    const element = gl.domElement;
    let dragging: { id: number; x: number; y: number } | null = null;

    const onDown = (event: PointerEvent) => {
      dragging = { id: event.pointerId, x: event.clientX, y: event.clientY };
    };
    const onMove = (event: PointerEvent) => {
      if (!dragging || dragging.id !== event.pointerId || flight.current)
        return;
      yaw.current -= (event.clientX - dragging.x) * LOOK_SPEED;
      pitch.current = Math.max(
        -MAX_PITCH,
        Math.min(
          MAX_PITCH,
          pitch.current - (event.clientY - dragging.y) * LOOK_SPEED,
        ),
      );
      dragging.x = event.clientX;
      dragging.y = event.clientY;
    };
    const onUp = (event: PointerEvent) => {
      if (dragging?.id === event.pointerId) dragging = null;
    };
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest("input, textarea, [role='dialog']")) return;
      const down = event.type === "keydown";
      if (event.code === "ShiftLeft" || event.code === "ShiftRight")
        keys.current.run = down;
      const direction = KEYS[event.code];
      if (!direction) return;
      keys.current[direction] = down;
      if (down && useStore.getState().panel) useStore.getState().closePanel();
      event.preventDefault();
    };
    const onBlur = () => {
      keys.current = {
        forward: false,
        back: false,
        left: false,
        right: false,
        run: false,
      };
    };

    element.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    window.addEventListener("blur", onBlur);
    return () => {
      element.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
      window.removeEventListener("blur", onBlur);
    };
  }, [gl]);

  useFrame((_, delta) => {
    // Long frames (a slow device, a background tab) would make walking jump.
    const step = Math.min(delta, 0.05);

    if (flight.current) {
      const current = flight.current;
      current.progress = Math.min(
        1,
        current.progress + Math.min(delta, 0.25) / FLY_SECONDS,
      );
      const t = current.progress;
      const eased = t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
      camera.position.lerpVectors(
        current.fromPosition,
        current.toPosition,
        eased,
      );
      camera.quaternion.slerpQuaternions(
        current.fromRotation,
        current.toRotation,
        eased,
      );
      if (t >= 1) {
        flight.current = null;
        syncAnglesFromCamera();
        arrive();
      }
      return;
    }

    camera.quaternion.setFromEuler(
      new Euler(pitch.current, yaw.current, 0, "YXZ"),
    );

    const touch = useStore.getState().touchMove;
    const pressed = keys.current;
    const forward =
      Number(pressed.forward || touch.forward) -
      Number(pressed.back || touch.back);
    const strafe =
      Number(pressed.right || touch.right) - Number(pressed.left || touch.left);
    if (!forward && !strafe) return;

    const speed = WALK_SPEED * (pressed.run ? RUN_MULTIPLIER : 1) * step;
    const length = Math.hypot(forward, strafe);
    const sin = Math.sin(yaw.current);
    const cos = Math.cos(yaw.current);
    const dx = ((-sin * forward + cos * strafe) / length) * speed;
    const dz = ((-cos * forward - sin * strafe) / length) * speed;

    // Slide along walls and furniture instead of stopping dead.
    const { x, z } = camera.position;
    if (!isBlocked(x + dx, z + dz)) {
      camera.position.x += dx;
      camera.position.z += dz;
    } else if (!isBlocked(x + dx, z)) {
      camera.position.x += dx;
    } else if (!isBlocked(x, z + dz)) {
      camera.position.z += dz;
    }
  });

  return null;
};

export default CameraRig;
