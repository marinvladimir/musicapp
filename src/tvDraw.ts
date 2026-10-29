import { Project } from "./data/cv";

const MONO = '"JetBrains Mono", ui-monospace, monospace';
const SANS = '"Space Grotesk", system-ui, sans-serif';

// Colour bars of an old broadcast test card.
const BARS = [
  "#c0c0c0",
  "#c0c000",
  "#00c0c0",
  "#00c000",
  "#c000c0",
  "#c00000",
  "#0000c0",
];
const LOWER_BARS = [
  "#0000c0",
  "#131313",
  "#c000c0",
  "#131313",
  "#00c0c0",
  "#131313",
  "#c0c0c0",
];

let noiseCanvas: HTMLCanvasElement | null = null;

// Black and white snow with a few rolling bright bands, drawn at a low
// resolution and scaled up so it looks chunky like real static.
export const drawStatic = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
) => {
  noiseCanvas ??= document.createElement("canvas");
  const noiseWidth = 160;
  const noiseHeight = 120;
  noiseCanvas.width = noiseWidth;
  noiseCanvas.height = noiseHeight;
  const noiseContext = noiseCanvas.getContext("2d")!;
  const image = noiseContext.createImageData(noiseWidth, noiseHeight);
  const bandY = Math.random() * noiseHeight;
  for (let y = 0; y < noiseHeight; y++) {
    const band = Math.abs(y - bandY) < 6 ? 70 : 0;
    for (let x = 0; x < noiseWidth; x++) {
      const value = Math.min(255, Math.random() * 255 + band);
      const index = (y * noiseWidth + x) * 4;
      image.data[index] = image.data[index + 1] = image.data[index + 2] = value;
      image.data[index + 3] = 255;
    }
  }
  noiseContext.putImageData(image, 0, 0);
  context.imageSmoothingEnabled = false;
  context.drawImage(noiseCanvas, 0, 0, width, height);
  context.imageSmoothingEnabled = true;
};

export const drawScanlines = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
) => {
  context.fillStyle = "rgba(0, 0, 0, 0.18)";
  const step = Math.max(2, Math.round(height / 160));
  for (let y = 0; y < height; y += step * 2)
    context.fillRect(0, y, width, step);
};

// Placeholder for channels without a demo video yet.
export const drawTestCard = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  project: Project,
) => {
  const barWidth = width / BARS.length;
  BARS.forEach((color, index) => {
    context.fillStyle = color;
    context.fillRect(index * barWidth, 0, Math.ceil(barWidth), height * 0.68);
  });
  LOWER_BARS.forEach((color, index) => {
    context.fillStyle = color;
    context.fillRect(
      index * barWidth,
      height * 0.68,
      Math.ceil(barWidth),
      height * 0.08,
    );
  });
  context.fillStyle = "#131313";
  context.fillRect(0, height * 0.76, width, height * 0.24);

  // Caption box with the project name.
  const boxWidth = width * 0.78;
  const boxHeight = height * 0.3;
  const boxX = (width - boxWidth) / 2;
  const boxY = height * 0.2;
  context.fillStyle = "rgba(10, 10, 20, 0.88)";
  context.fillRect(boxX, boxY, boxWidth, boxHeight);
  context.strokeStyle = "#ffffff";
  context.lineWidth = Math.max(2, width / 320);
  context.strokeRect(boxX, boxY, boxWidth, boxHeight);

  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = "#ffffff";
  context.font = `700 ${Math.round(height * 0.085)}px ${SANS}`;
  context.fillText(
    project.name,
    width / 2,
    boxY + boxHeight * 0.4,
    boxWidth * 0.92,
  );
  context.fillStyle = "#4fd1c5";
  context.font = `500 ${Math.round(height * 0.04)}px ${MONO}`;
  context.fillText(
    project.status.toUpperCase(),
    width / 2,
    boxY + boxHeight * 0.75,
    boxWidth * 0.9,
  );

  context.fillStyle = "#c0c0c0";
  context.font = `500 ${Math.round(height * 0.045)}px ${MONO}`;
  context.fillText("DEMO COMING SOON", width / 2, height * 0.88);
  context.textAlign = "left";
  context.textBaseline = "alphabetic";
};

export const drawOsd = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  channelNumber: number,
) => {
  const text = `CH ${String(channelNumber).padStart(2, "0")}`;
  context.font = `700 ${Math.round(height * 0.09)}px ${MONO}`;
  context.textAlign = "right";
  context.textBaseline = "top";
  context.fillStyle = "rgba(0, 0, 0, 0.6)";
  context.fillText(text, width * 0.94 + 3, height * 0.06 + 3);
  context.fillStyle = "#5dff7a";
  context.fillText(text, width * 0.94, height * 0.06);
  context.textAlign = "left";
  context.textBaseline = "alphabetic";
};
