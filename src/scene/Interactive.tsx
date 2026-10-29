import React, { useState } from "react";
import { ThreeEvent } from "@react-three/fiber";
import { useStore } from "../store";

// Pointer movement (in pixels) above which a press counts as looking around
// rather than a click.
const CLICK_TOLERANCE = 6;

const Interactive: React.FC<{
  label: string;
  onSelect: () => void;
  onHoverChange?: (hovered: boolean) => void;
  children: (hovered: boolean) => React.ReactNode;
}> = ({ label, onSelect, onHoverChange, children }) => {
  const [hovered, setHovered] = useState(false);
  const setHoverLabel = useStore((state) => state.setHoverLabel);

  const handleOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setHovered(true);
    onHoverChange?.(true);
    setHoverLabel(label);
    document.body.style.cursor = "pointer";
  };

  const handleOut = () => {
    setHovered(false);
    onHoverChange?.(false);
    setHoverLabel(null);
    document.body.style.cursor = "";
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (event.delta > CLICK_TOLERANCE) return;
    onSelect();
  };

  return (
    <group
      onPointerOver={handleOver}
      onPointerOut={handleOut}
      onClick={handleClick}
    >
      {children(hovered)}
    </group>
  );
};

export default Interactive;
