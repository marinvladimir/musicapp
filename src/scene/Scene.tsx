import React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { updateAnalysis } from "../audio/analysis";
import CameraRig from "./CameraRig";
import Room from "./Room";
import CvDesk from "./CvDesk";
import ComputerCorner from "./ComputerCorner";
import Bookshelf from "./Bookshelf";
import Turntable3D from "./Turntable3D";
import Projection from "./Projection";
import Effects from "./Effects";
import Decor from "./Decor";
import StandMarkers from "./StandMarkers";
import TechWalls from "./TechWalls";

const AudioAnalysis: React.FC = () => {
  useFrame((_, delta) => updateAnalysis(delta));
  return null;
};

const Scene: React.FC = () => (
  <Canvas
    camera={{ fov: 62, near: 0.05, far: 40 }}
    dpr={[1, 1.75]}
    gl={{ antialias: true }}
    style={{ position: "fixed", inset: 0, touchAction: "none" }}
    aria-label="A 3D room: CV on the desk, projects on the TV to the left, music on the shelf to the right"
  >
    <color attach="background" args={["#12121f"]} />
    <AudioAnalysis />
    <CameraRig />
    <Room />
    <Projection />
    <CvDesk />
    <ComputerCorner />
    <Bookshelf />
    <Turntable3D />
    <Decor />
    <StandMarkers />
    <TechWalls />
    <Effects />
  </Canvas>
);

export default Scene;
