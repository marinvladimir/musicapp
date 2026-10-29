import React, { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Euler, Matrix4, Quaternion, Vector3 } from "three";
import { useStore } from "../store";
import { playWhoosh } from "../audio/sfx";
import { OBSTACLES, OVERVIEW, ROOM, STATIONS } from "./layout";

const WALK_SPEED = 2.2; // metres per second
const RUN_MULTIPLIER = 1.8;
const LOOK_SPEED = 0.004; // radians per dragged pixel
const MAX_PITCH = 1.1;
// Without free roam, dragging only looks this far (in radians) from the
// direction the camera was placed in.
const GUIDED_YAW = 0.35;
const GUIDED_PITCH = 0.2;
const FLY_SECONDS = 1.2;
// Width of the music panel on the left (with its margin), in CSS pixels, and
// the screen width below which it becomes a bottom sheet instead.
const DRAWER_WIDTH = 416;
const DRAWER_MIN_SCREEN = 640;
const ENTER_SECONDS = 2.4;
const WALL_MARGIN = 0.4;
const OBSTACLE_MARGIN = 0.3;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

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
  const { camera, gl, size } = useThree();
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
    seconds: number;
    onDone: () => void;
  } | null>(null);
  const flyTarget = useStore((state) => state.flyTarget);
  const arrive = useStore((state) => state.arrive);
  const entered = useStore((state) => state.entered);

  const baseYaw = useRef(0);
  const basePitch = useRef(0);

  const syncAnglesFromCamera = () => {
    const euler = new Euler().setFromQuaternion(camera.quaternion, "YXZ");
    yaw.current = baseYaw.current = euler.y;
    pitch.current = basePitch.current = euler.x;
  };

  const flyTo = (
    position: [number, number, number],
    lookAt: [number, number, number],
    seconds: number,
    onDone: () => void,
  ) => {
    const toPosition = new Vector3(...position);
    const toRotation = lookRotation(toPosition, new Vector3(...lookAt));
    if (prefersReducedMotion()) {
      camera.position.copy(toPosition);
      camera.quaternion.copy(toRotation);
      syncAnglesFromCamera();
      onDone();
      return;
    }
    playWhoosh(seconds);
    flight.current = {
      fromPosition: camera.position.clone(),
      toPosition,
      fromRotation: camera.quaternion.clone(),
      toRotation,
      progress: 0,
      seconds,
      onDone,
    };
  };

  // Walk in from the doorway once the visitor leaves the intro screen.
  useEffect(() => {
    if (!entered) return;
    flyTo(OVERVIEW.position, OVERVIEW.lookAt, ENTER_SECONDS, () =>
      useStore.setState({ location: "overview" }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entered]);

  useEffect(() => {
    if (!flyTarget) return;
    const pose = flyTarget === "overview" ? OVERVIEW : STATIONS[flyTarget];
    flyTo(pose.position, pose.lookAt, FLY_SECONDS, arrive);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyTarget, arrive]);

  useEffect(() => {
    const element = gl.domElement;
    let dragging: { id: number; x: number; y: number } | null = null;

    const onDown = (event: PointerEvent) => {
      dragging = { id: event.pointerId, x: event.clientX, y: event.clientY };
    };
    const onMove = (event: PointerEvent) => {
      if (!dragging || dragging.id !== event.pointerId || flight.current)
        return;
      const nextYaw = yaw.current - (event.clientX - dragging.x) * LOOK_SPEED;
      const nextPitch =
        pitch.current - (event.clientY - dragging.y) * LOOK_SPEED;
      if (useStore.getState().freeRoam) {
        yaw.current = nextYaw;
        pitch.current = clamp(nextPitch, -MAX_PITCH, MAX_PITCH);
      } else {
        yaw.current = clamp(
          nextYaw,
          baseYaw.current - GUIDED_YAW,
          baseYaw.current + GUIDED_YAW,
        );
        pitch.current = clamp(
          nextPitch,
          basePitch.current - GUIDED_PITCH,
          basePitch.current + GUIDED_PITCH,
        );
      }
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
      const state = useStore.getState();
      if (!state.entered) return;

      // Without free roam the arrow keys move between the stations.
      if (!state.freeRoam) {
        if (!down || flight.current) return;
        if (event.code === "ArrowRight") state.stepStation(1);
        else if (event.code === "ArrowLeft") state.stepStation(-1);
        else if (event.code === "ArrowDown") state.goTo("overview");
        else return;
        event.preventDefault();
        return;
      }

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

  // With the music panel open on the left, shift the picture to the right so
  // the shelf is not hidden behind it.
  const viewShift = useRef(0);
  const updateViewShift = (delta: number) => {
    const { panel } = useStore.getState();
    const target =
      panel === "music" && size.width > DRAWER_MIN_SCREEN
        ? -DRAWER_WIDTH / 2
        : 0;
    if (target === 0 && Math.abs(viewShift.current) < 0.5) {
      if (camera.view?.enabled) camera.clearViewOffset();
      viewShift.current = 0;
      return;
    }
    viewShift.current += (target - viewShift.current) * Math.min(1, delta * 6);
    camera.setViewOffset(
      size.width,
      size.height,
      viewShift.current,
      0,
      size.width,
      size.height,
    );
  };

  useFrame(({ clock }, delta) => {
    updateViewShift(delta);

    // Behind the intro screen the camera slowly drifts by the doorway.
    if (!useStore.getState().entered) {
      const t = clock.elapsedTime;
      camera.position.set(
        Math.sin(t * 0.15) * 1.4,
        2.1 + Math.sin(t * 0.3) * 0.08,
        4.5,
      );
      camera.lookAt(0, 1.3, -3);
      return;
    }

    // Long frames (a slow device, a background tab) would make walking jump.
    const step = Math.min(delta, 0.05);

    if (flight.current) {
      const current = flight.current;
      current.progress = Math.min(
        1,
        current.progress + Math.min(delta, 0.25) / current.seconds,
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
        current.onDone();
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
