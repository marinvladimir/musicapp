import { useEffect, useMemo } from "react";
import { CanvasTexture, SRGBColorSpace } from "three";
import { trackLoading } from "../loading";

export const SANS = '"Space Grotesk", system-ui, sans-serif';
export const MONO = '"JetBrains Mono", ui-monospace, monospace';

let fontsReady: Promise<unknown> | null = null;

// Canvas text is drawn once, so wait for the web fonts before drawing.
export const whenFontsReady = () => {
  fontsReady ??= trackLoading(
    Promise.all([
      document.fonts.load(`700 40px ${SANS}`),
      document.fonts.load(`400 40px ${SANS}`),
      document.fonts.load(`400 40px ${MONO}`),
    ]),
  ).catch(() => undefined);
  return fontsReady;
};

const images = new Map<string, Promise<HTMLImageElement>>();

export const loadImage = (url: string) => {
  if (!images.has(url)) {
    images.set(
      url,
      trackLoading(
        new Promise((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = reject;
          image.src = url;
        }),
      ),
    );
  }
  return images.get(url)!;
};

export const roundRect = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
};

// Wraps `text` to `maxWidth` and returns the y position after the last line.
export const wrapText = (
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = Infinity,
) => {
  const words = text.split(" ");
  let line = "";
  let lines = 0;
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width > maxWidth && line) {
      context.fillText(line, x, y);
      y += lineHeight;
      line = word;
      if (++lines >= maxLines) return y;
    } else {
      line = candidate;
    }
  }
  if (line) {
    context.fillText(line, x, y);
    y += lineHeight;
  }
  return y;
};

// A texture backed by a 2D canvas. `draw` may be async (to wait for fonts or
// images); the texture is refreshed when it finishes.
export const useCanvasTexture = (
  width: number,
  height: number,
  draw: (context: CanvasRenderingContext2D) => void | Promise<void>,
  deps: unknown[] = [],
) => {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const result = new CanvasTexture(canvas);
    result.colorSpace = SRGBColorSpace;
    result.anisotropy = 4;
    return result;
  }, [width, height]);

  useEffect(() => {
    let cancelled = false;
    const canvas = texture.image as HTMLCanvasElement;
    const context = canvas.getContext("2d")!;
    Promise.resolve(whenFontsReady())
      .then(() => (cancelled ? undefined : draw(context)))
      .then(() => {
        if (!cancelled) texture.needsUpdate = true;
      })
      .catch((error) => console.error("Failed to draw texture:", error));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texture, ...deps]);

  useEffect(() => () => texture.dispose(), [texture]);

  return texture;
};
