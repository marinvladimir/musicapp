import { HISTORY_LENGTH, SILENCE_DB, toLevel } from "./analysis";
import { theme } from "../theme";

type Box = { x: number; y: number; width: number; height: number };

export const drawSpectrum = (
  context: CanvasRenderingContext2D,
  bars: number[],
  { x, y, width, height }: Box,
) => {
  const gap = Math.max(1, width / bars.length / 5);
  const barWidth = (width - gap * (bars.length - 1)) / bars.length;
  const gradient = context.createLinearGradient(0, y + height, 0, y);
  gradient.addColorStop(0, theme.colors.accent);
  gradient.addColorStop(1, theme.colors.purple);
  context.fillStyle = gradient;

  bars.forEach((value, index) => {
    const barHeight = Math.max(2, value * height);
    context.fillRect(
      x + index * (barWidth + gap),
      y + height - barHeight,
      barWidth,
      barHeight,
    );
  });
};

export const drawLoudness = (
  context: CanvasRenderingContext2D,
  history: number[],
  { x, y, width, height }: Box,
) => {
  // Guide lines at -10, -20, -30 and -40 dB.
  context.strokeStyle = "rgba(255, 255, 255, 0.1)";
  context.lineWidth = 1;
  for (let db = -10; db > SILENCE_DB; db -= 10) {
    const lineY = y + height - toLevel(db) * height;
    context.beginPath();
    context.moveTo(x, lineY);
    context.lineTo(x + width, lineY);
    context.stroke();
  }
  if (history.length < 2) return;

  const step = width / (HISTORY_LENGTH - 1);
  const offset = HISTORY_LENGTH - history.length;
  const pointX = (index: number) => x + (offset + index) * step;
  const pointY = (level: number) => y + height - level * height;

  context.beginPath();
  context.moveTo(pointX(0), y + height);
  history.forEach((level, index) =>
    context.lineTo(pointX(index), pointY(level)),
  );
  context.lineTo(pointX(history.length - 1), y + height);
  context.closePath();
  const fill = context.createLinearGradient(0, y, 0, y + height);
  fill.addColorStop(0, "rgba(181, 108, 255, 0.55)");
  fill.addColorStop(1, "rgba(108, 99, 255, 0.05)");
  context.fillStyle = fill;
  context.fill();

  context.beginPath();
  history.forEach((level, index) => {
    if (index === 0) context.moveTo(pointX(index), pointY(level));
    else context.lineTo(pointX(index), pointY(level));
  });
  context.strokeStyle = theme.colors.pink;
  context.lineWidth = Math.max(2, height / 80);
  context.stroke();
};
