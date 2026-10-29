import React, { useEffect, useRef } from "react";
import { analysis } from "../audio/analysis";
import { drawSpectrum } from "../audio/draw";

// Small spectrum for the music panel. The scene updates `analysis` every
// frame, so this only draws it.
const MiniVisualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let frame = 0;
    const render = () => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      if (canvas && context) {
        const ratio = window.devicePixelRatio || 1;
        const width = Math.round(canvas.clientWidth * ratio);
        const height = Math.round(canvas.clientHeight * ratio);
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }
        context.clearRect(0, 0, width, height);
        drawSpectrum(context, analysis.bars, { x: 0, y: 0, width, height });
      }
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Frequency spectrum of the playing song"
      style={{ width: "100%", height: 56, display: "block" }}
    />
  );
};

export default MiniVisualizer;
