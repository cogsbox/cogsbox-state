import { createCogsState } from '../../../src/CogsState';
import { useEffect, useRef, useState } from 'react';

// --- Configuration ---
export const WIDTH = 88;
export const HEIGHT = 22;
const TOTAL = WIDTH * HEIGHT;

// Define the initial state for our LCD screen
const initialState = {
  lcd: {
    pixels: Array.from(new Uint8Array(TOTAL)), // Convert to regular array
  },
};

// Create the state and the hook we'll use in our components
export const { useCogsState: useLcdState } = createCogsState(initialState);

type AnimationState =
  | 'INITIAL_DELAY'
  | 'SCROLLING'
  | 'FINAL_DELAY'
  | 'FADING_OUT'
  | 'FINISHED';

type Props = {
  svg: string;
  speed?: number;
  scale?: number;
  fade?: number;
  startX?: number;
  endX?: number;
  initialDelay?: number;
  finalDelay?: number;
  repeat?: boolean;
  isRandomPixels?: boolean; // NEW: Enable stress testing
  randomPixels?: number; // NEW: Number of random pixels to update per frame
};

export default function LCDCatScroller({
  svg,
  speed = 1,
  scale = 4,
  fade = 0.85,
  startX = 0,
  endX = 0,
  initialDelay = 2,
  finalDelay = 3,
  repeat = true,
  isRandomPixels = true, // NEW
  randomPixels = 20, // NEW
}: Props) {
  // Use the state manager instead of local state
  const lcdState = useLcdState('lcd');

  const [cat, setCat] = useState<{ data: Uint8Array; width: number } | null>(
    null
  );

  const frameRef = useRef(0);
  const animationStateRef = useRef<AnimationState>('INITIAL_DELAY');

  // --- Effect 1: Rasterize the SVG (No changes here) ---
  useEffect(() => {
    const rasterizeSvgToGrid = async (
      svgString: string
    ): Promise<{ data: Uint8Array; width: number }> => {
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      const p = new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      img.src = url;
      await p;
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      const catCanvasWidth = Math.round(HEIGHT * aspectRatio);
      const canvas = document.createElement('canvas');
      canvas.width = catCanvasWidth;
      canvas.height = HEIGHT;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, catCanvasWidth, HEIGHT);
      const imageData = ctx.getImageData(0, 0, catCanvasWidth, HEIGHT).data;
      const out = new Uint8Array(catCanvasWidth * HEIGHT);
      for (let i = 0; i < out.length; i++) {
        const a = imageData[i * 4 + 3];
        const brightness =
          (imageData[i * 4]! + imageData[i * 4 + 1]! + imageData[i * 4 + 2]!) /
          3;
        if (a! > 128 && brightness < 128) {
          out[i] = 255;
        }
      }
      URL.revokeObjectURL(url);
      return { data: out, width: catCanvasWidth };
    };
    rasterizeSvgToGrid(svg).then(setCat);
  }, [svg]);

  // --- Effect 2: Animate the scroller ---
  useEffect(() => {
    if (!cat) return;

    // Reset animation state
    animationStateRef.current = 'INITIAL_DELAY';
    frameRef.current = 0;

    const finalEndX = endX ?? WIDTH - cat.width;
    const INITIAL_DELAY_FRAMES = initialDelay * 60;
    const FINAL_DELAY_FRAMES = finalDelay * 60;

    let raf: number;
    const buffer = new Uint8Array(TOTAL);
    const { data: catPixels, width: catWidth } = cat;

    const drawAt = (xOffset: number) => {
      const roundedX = Math.round(xOffset);
      for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < catWidth; x++) {
          const dstX = roundedX + x;
          if (dstX >= 0 && dstX < WIDTH) {
            if (catPixels[y * catWidth + x]) {
              const dst = y * WIDTH + dstX;
              buffer[dst] = 255;
            }
          }
        }
      }
    };

    const loop = () => {
      const currentState = animationStateRef.current;
      if (currentState === 'FINISHED') {
        cancelAnimationFrame(raf);
        return;
      }

      const frame = frameRef.current++;

      // Apply fade effect
      for (let i = 0; i < TOTAL; i++) {
        buffer[i] = Math.floor(buffer[i]! * fade);
      }

      switch (currentState) {
        case 'INITIAL_DELAY':
          drawAt(startX);
          if (frame > INITIAL_DELAY_FRAMES) {
            animationStateRef.current = 'SCROLLING';
            frameRef.current = 0;
          }
          break;

        case 'SCROLLING':
          const distance = finalEndX - startX;
          const scrollDurationFrames = Math.max(1, Math.abs(distance) / speed);
          const progress = Math.min(frame / scrollDurationFrames, 1);
          const currentX = startX + distance * progress;
          drawAt(currentX);

          if (progress >= 1) {
            animationStateRef.current = 'FINAL_DELAY';
            frameRef.current = 0;
          }
          break;

        case 'FINAL_DELAY':
          drawAt(finalEndX);
          if (frame > FINAL_DELAY_FRAMES) {
            animationStateRef.current = 'FADING_OUT';
            frameRef.current = 0;
          }
          break;

        case 'FADING_OUT':
          if (buffer.every((p) => p === 0)) {
            if (repeat) {
              animationStateRef.current = 'INITIAL_DELAY';
              frameRef.current = 0;
            } else {
              animationStateRef.current = 'FINISHED';
            }
          }
          break;
      }

      // NEW: Add stress test random pixels AFTER cat drawing
      if (isRandomPixels) {
        for (let i = 0; i < randomPixels; i++) {
          const randomIndex = Math.floor(Math.random() * TOTAL);
          buffer[randomIndex] = 255; // Always max brightness so we can see them
        }
      }

      // KEY FIX: Update the state manager with the new pixel data
      // Convert Uint8Array to regular array for better compatibility with the shadow system
      lcdState.pixels.update(Array.from(buffer));

      raf = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(raf);
  }, [
    cat,
    speed,
    fade,
    startX,
    endX,
    initialDelay,
    finalDelay,
    repeat,
    isRandomPixels,
    randomPixels,
    lcdState,
  ]);

  // Get the current pixel data from state manager
  const currentPixels = lcdState.pixels.get();

  return (
    <div
      className="grid bg-black"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${WIDTH}, ${scale}px)`,
        width: WIDTH * scale,
      }}
    >
      {Array.from(currentPixels).map((val, i) => (
        <div
          key={i}
          style={{
            backgroundColor: `rgb(0, ${val}, 0)`,
            width: `${scale}px`,
            aspectRatio: '1 / 1',
          }}
        />
      ))}
    </div>
  );
}
