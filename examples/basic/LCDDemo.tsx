import React, { useEffect, useRef, useState } from 'react';
import { createCogsState } from '@lib/CogsState';

// Your existing LCD configuration - Fixed pixel count
const WIDTH = 88;
const HEIGHT = 22;
const TOTAL = WIDTH * HEIGHT;

// Color presets
const COLOR_PRESETS = {
  green: { r: 0, g: 255, b: 0 },
  amber: { r: 255, g: 191, b: 0 },
  blue: { r: 0, g: 200, b: 255 },
  white: { r: 255, g: 255, b: 255 },
  red: { r: 255, g: 0, b: 0 },
  purple: { r: 200, g: 0, b: 255 },
  cyan: { r: 0, g: 255, b: 255 },
};

// Extend the state to include controls (including the delays)
const initialState = {
  lcd: {
    pixels: Array.from(new Uint8Array(TOTAL)),
    controls: {
      speed: 2,
      fade: 0.85,
      startX: 0,
      endX: null as number | null,
      initialDelay: 1,
      finalDelay: 0.5,
      repeat: true,
      stressTest: false,
      randomPixels: 100,
      color: 'green' as keyof typeof COLOR_PRESETS,
    },
    stats: {
      fps: 0, // Note: FPS is not currently calculated/updated in this loop.
      litPixels: 0,
      lastUpdate: Date.now(), // Note: Not used for FPS calc currently.
    },
  },
};

// Create state manager
export const { useCogsState: useLcdState } = createCogsState(initialState);

// LCDCatScrollerStateful component - Renders the grid using state, receives pixelScale as prop
function LCDCatScrollerStateful({
  svg,
  pixelScale,
}: {
  svg: string;
  pixelScale: number;
}) {
  const lcdState = useLcdState('lcd'); // Access Cogs state
  const [cat, setCat] = React.useState<{
    data: Uint8Array;
    width: number;
  } | null>(null);
  const frameRef = useRef(0); // Frame count within the current state
  const animationStateRef = useRef<
    'INITIAL_DELAY' | 'SCROLLING' | 'FINAL_DELAY' | 'FADING_OUT' | 'FINISHED'
  >('INITIAL_DELAY');

  // Use ref for the pixel buffer so it persists between renders/frames
  const bufferRef = useRef(new Uint8Array(TOTAL).fill(0));

  // Rasterize SVG (only runs once)
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
      // Determine cat canvas width, ensuring it doesn't exceed LCD width
      const catCanvasWidth = Math.min(WIDTH, Math.round(HEIGHT * aspectRatio));

      const canvas = document.createElement('canvas');
      canvas.width = catCanvasWidth;
      canvas.height = HEIGHT;
      const ctx = canvas.getContext('2d')!;
      // Draw the image scaled to fit the HEIGHT while maintaining aspect ratio
      ctx.drawImage(img, 0, 0, catCanvasWidth, HEIGHT);

      const imageData = ctx.getImageData(0, 0, catCanvasWidth, HEIGHT).data;
      const out = new Uint8Array(catCanvasWidth * HEIGHT);
      for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < catCanvasWidth; x++) {
          const i = y * catCanvasWidth + x;
          const imgDataIndex = i * 4;
          const a = imageData[imgDataIndex + 3];
          const r = imageData[imgDataIndex];
          const g = imageData[imgDataIndex + 1];
          const b = imageData[imgDataIndex + 2];

          // Calculate brightness (simple average as in original)
          const brightness = (r + g + b) / 3;

          // Treat as "on" pixel if mostly opaque AND relatively dark (as in original)
          if (a > 128 && brightness < 128) {
            out[i] = 255; // Max brightness for "on" pixel
          }
        }
      }
      URL.revokeObjectURL(url);
      return { data: out, width: catCanvasWidth };
    };
    rasterizeSvgToGrid(svg).then(setCat);
  }, [svg]);

  // Animation loop
  useEffect(() => {
    if (!cat) return;

    let raf: number;
    const buffer = bufferRef.current; // Use the persistent buffer ref

    const { data: catPixels, width: catWidth } = cat;

    // This function draws the cat pixels onto the buffer at a given x offset.
    // It draws *on top* of existing content, setting cat pixels to 255.
    const drawCatToBuffer = (xOffset: number, targetBuffer: Uint8Array) => {
      const roundedX = Math.round(xOffset);
      for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < catWidth; x++) {
          const dstX = roundedX + x;
          if (dstX >= 0 && dstX < WIDTH) {
            if (catPixels[y * catWidth + x]) {
              const dst = y * WIDTH + dstX;
              // Draw "on" pixels at full brightness (255) on the buffer.
              targetBuffer[dst] = 255;
            }
          }
        }
      }
    };

    // Function to calculate the number of frames needed to fade out based on the fade factor
    // We need to find 'n' such that initial_brightness * fade^n < threshold
    // log(initial_brightness * fade^n) < log(threshold)
    // log(initial_brightness) + n * log(fade) < log(threshold)
    // n * log(fade) < log(threshold) - log(initial_brightness)
    // n * log(fade) < log(threshold / initial_brightness)
    // If fade < 1 (typical), log(fade) is negative. Divide by log(fade) and flip inequality:
    // n > log(threshold / initial_brightness) / log(fade)
    // Since we want the *minimum* integer frames, we take the ceiling.
    const calculateFadeOutFrames = (fadeFactor: number): number => {
      // For fade values close to 1 (like 0.99), we need more frames to fade out
      // For lower fade values (like 0.5), we need fewer frames
      return Math.ceil(1 / (1 - fadeFactor));
    };
    let fadeOutDurationFrames = 0; // Will be calculated when entering FADING_OUT state

    const loop = () => {
      const controls = lcdState.controls.get();
      let currentState = animationStateRef.current;
      let frame = frameRef.current; // Get current frame count for the state

      // Calculate state durations based on controls (in frames, assuming ~60fps)
      const INITIAL_DELAY_FRAMES = Math.round(controls.initialDelay * 60);
      const FINAL_DELAY_FRAMES = Math.round(controls.finalDelay * 60);
      const finalEndX = controls.endX ?? WIDTH - catWidth;
      const startX = controls.startX; // Use startX from controls

      // Calculate scroll parameters (using original logic for speed)
      const distance = finalEndX - startX;
      // Original calculation - speed seems to be relative to frames
      const scrollDurationFrames = Math.max(
        1, // Ensure duration is at least 1 frame
        Math.abs(distance / controls.speed)
      );

      // --- State Transition Logic ---
      switch (currentState) {
        case 'INITIAL_DELAY':
          if (frame >= INITIAL_DELAY_FRAMES) {
            currentState = 'SCROLLING';
            frameRef.current = 0; // Reset frame count for the new state
          }
          break;

        case 'SCROLLING': {
          const progress = Math.min(frame / scrollDurationFrames, 1);
          if (progress >= 1) {
            currentState = 'FINAL_DELAY';
            frameRef.current = 0; // Reset frame count for the new state
          }
          break;
        }

        case 'FINAL_DELAY':
          if (frame >= FINAL_DELAY_FRAMES) {
            currentState = 'FADING_OUT';
            frameRef.current = 0; // Reset frame count for the new state
            // IMPORTANT: Calculate the fade-out duration dynamically when entering this state
            fadeOutDurationFrames = calculateFadeOutFrames(controls.fade);
            // The buffer still contains the final frame of the cat from SCROLLING.
            // We start fading from this content.
          }
          break;

        case 'FADING_OUT': {
          // Apply the fade to all pixels in the buffer.
          // This happens *every frame* while in this state.
          const fadeFactor = controls.fade;
          for (let i = 0; i < TOTAL; i++) {
            buffer[i] = Math.floor(buffer[i] * fadeFactor);
          }

          // --- FADING_OUT Termination Condition (Time-Based, Dynamic Duration) ---
          // Transition out of FADING_OUT after the dynamically calculated duration.
          let shouldTransition = false;
          if (frame >= fadeOutDurationFrames) {
            shouldTransition = true;
          }

          if (shouldTransition) {
            if (controls.repeat) {
              currentState = 'INITIAL_DELAY';
              frameRef.current = 0; // Reset frame for the new cycle
              // IMPORTANT: Clear the buffer explicitly when starting a new cycle after fading.
              buffer.fill(0);
            } else {
              currentState = 'FINISHED';
              // No need to clear buffer on FINISHED here, the final clear happens below.
            }
          }
          break;
        }

        case 'FINISHED':
          // If not repeating, stay in this state and let the cleanup handle the end.
          // If repeating, this state shouldn't be reached because FADING_OUT transitions to INITIAL_DELAY.
          if (!controls.repeat) {
            // The loop will be cancelled by the outer check below.
            // Ensure buffer is cleared on exit.
          }
          break;
      }

      // Handle early exit if FINISHED and not repeating
      if (currentState === 'FINISHED' && !controls.repeat) {
        cancelAnimationFrame(raf);
        // Ensure screen is clear when animation stops completely
        buffer.fill(0); // Make sure the screen is blank if we stop
        lcdState.pixels.update(Array.from(buffer)); // Push final blank state
        lcdState.stats.litPixels.update(0);
        animationStateRef.current = currentState; // Update state ref one last time
        return; // Stop the loop here
      }

      // Increment frame count *after* state transition checks for the *next* iteration
      frameRef.current++;

      // Update the animation state ref for the next iteration.
      animationStateRef.current = currentState;

      // --- Buffer Manipulation & Drawing ---
      // Always apply fade *before* drawing new content for the current frame,
      // except in FADING_OUT state where fade was already applied at the start of the case.
      // Or, simplify: apply fade *after* drawing cat/stress pixels, affecting all content.
      // Let's stick to applying fade *after* drawing content, which is consistent with the original structure
      // outside of the FADING_OUT case.

      // In INITIAL_DELAY, SCROLLING, or FINAL_DELAY, draw the cat for the current frame.
      // This draws *on top* of whatever is currently in the buffer (which might be faded pixels).
      if (
        currentState === 'INITIAL_DELAY' ||
        currentState === 'SCROLLING' ||
        currentState === 'FINAL_DELAY'
      ) {
        // Calculate the current x position based on state and frame progress
        let currentFrameX = startX; // Default for INITIAL_DELAY
        // Recalculate progress for this frame based on the (potentially just reset) frame count
        const currentProgress = Math.min(
          frameRef.current / scrollDurationFrames,
          1
        );

        if (currentState === 'SCROLLING') {
          currentFrameX = startX + distance * currentProgress;
        } else if (currentState === 'FINAL_DELAY') {
          currentFrameX = finalEndX; // Cat is fixed at the end position
        }

        // Draw the cat onto the buffer for this frame.
        // This will overwrite existing pixel values where the cat is drawn (setting them to 255).
        drawCatToBuffer(currentFrameX, buffer);
      }
      // Note: If currentState is FADING_OUT or FINISHED, no new cat is drawn here.
      // The buffer retains its previous values which are then faded.

      // Add stress test random pixels.
      // These are drawn ON TOP of whatever is already in the buffer (cat or faded pixels).
      // These are always full brightness (255).
      if (controls.stressTest) {
        for (let i = 0; i < controls.randomPixels; i++) {
          const randomIndex = Math.floor(Math.random() * TOTAL);
          buffer[randomIndex] = 255;
        }
      }

      // --- Apply Fade ---
      // This applies the fade factor to the ENTIRE buffer.
      // It reduces the brightness of the cat pixels just drawn, the stress test pixels just drawn,
      // and any lingering faded pixels from previous frames.
      // This happens in ALL states except FINISHED.
      if (currentState !== 'FINISHED') {
        const fadeFactor = controls.fade;
        for (let i = 0; i < TOTAL; i++) {
          buffer[i] = Math.floor(buffer[i] * fadeFactor);
        }
      }

      // --- Update Cogs State (This pushes the buffer to the UI) ---
      // Ensure the Cogs state `pixels` array is a *copy* of the buffer.
      lcdState.pixels.update(Array.from(buffer));

      // Update stats
      let litCount = 0;
      for (let i = 0; i < TOTAL; i++) {
        if (buffer[i] > 0) {
          // Count any pixel with brightness > 0
          litCount++;
        }
      }
      lcdState.stats.litPixels.update(litCount);

      // Request the next frame.
      raf = requestAnimationFrame(loop);
    };

    // Start the loop
    loop();

    // Cleanup function: cancels the requestAnimationFrame when the effect re-runs or component unmounts
    return () => {
      cancelAnimationFrame(raf);
      // Ensure the buffer is cleared and state is updated on cleanup
      buffer.fill(0);
      lcdState.pixels.update(Array.from(buffer));
      lcdState.stats.litPixels.update(0);
    };

    // Dependencies: cat object (contains rasterized pixel data), and lcdState (specifically controls)
    // We need lcdState to read controls like speed, fade, delays, repeat, stressTest, startX, endX.
    // Use lcdState.controls.get() inside the loop to get the latest values.
  }, [cat, lcdState]); // Re-run effect if cat data changes or lcdState manager instance changes (rare)

  // ... rest of the LCDCatScrollerStateful component (rendering) ...
  // The rendering part remains the same, reading directly from the state.
  const currentPixels = lcdState.pixels.get();
  const colorName = lcdState.controls.color.get();
  const color = COLOR_PRESETS[colorName];

  return (
    <div
      className="min-w-0 rounded-md bg-gray-900 p-4 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.02),rgba(255,255,255,0.02)_2px,transparent_2px,transparent_4px)]"
      style={{ overflowX: 'auto' }}
    >
      <div
        className="grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${WIDTH}, ${pixelScale}px)`,
          width: WIDTH * pixelScale,
          backgroundColor: 'black',
          height: HEIGHT * pixelScale,
          flexShrink: 0,
        }}
      >
        {Array.from(currentPixels).map((val, i) => (
          <div
            key={i}
            style={{
              backgroundColor:
                val > 0
                  ? `rgb(${(color.r * val) / 255}, ${(color.g * val) / 255}, ${
                      (color.b * val) / 255
                    })`
                  : 'rgb(0, 0, 0)', // Ensure completely black for value 0
              width: `${pixelScale}px`,
              aspectRatio: '1 / 1',
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Demo wrapper
export default function LCDCatScrollerDemo({ catSvg }: { catSvg: string }) {
  const lcdState = useLcdState('lcd');
  const controls = lcdState.controls;
  const stats = lcdState.stats;
  const [pixelScale, setPixelScale] = useState(16);

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        <h1 className="text-3xl font-bold text-gray-200 mb-6">
          LCD Cat Scroller Demo
        </h1>

        <div className="border border-gray-700/50 rounded-lg p-6 mb-6">
          <div className="flex justify-center">
            <div className="rounded-2xl bg-slate-300 p-6 shadow-xl border-b-4 border-slate-400">
              <div className="rounded-lg bg-slate-600 p-2 shadow-inner border-t border-slate-500">
                <LCDCatScrollerStateful svg={catSvg} pixelScale={pixelScale} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#1a1a1a] border border-gray-700/50 rounded-lg p-4">
            <h3 className="text-sm font-bold text-gray-200 mb-3">Animation</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  Speed (Pixels / Frame Unit)
                </label>
                {/* Clarified label based on original logic */}
                <input
                  type="range"
                  value={controls.speed.get()}
                  onChange={(e) =>
                    controls.speed.update(parseFloat(e.target.value))
                  }
                  min="0.1"
                  max="5"
                  step="0.1"
                  className="w-full"
                />
                <div className="text-xs text-gray-500 flex justify-between">
                  <span>0.1</span>
                  <span>{controls.speed.get().toFixed(1)}</span>
                  <span>5.0</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Fade</label>
                <input
                  type="range"
                  value={controls.fade.get()}
                  onChange={(e) =>
                    controls.fade.update(parseFloat(e.target.value))
                  }
                  min="0.5"
                  max="0.99"
                  step="0.01"
                  className="w-full"
                />
                <div className="text-xs text-gray-500 flex justify-between">
                  <span>0.5</span>
                  <span>{controls.fade.get().toFixed(2)}</span>
                  <span>0.99</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  Initial Delay (s)
                </label>
                <input
                  type="range"
                  value={controls.initialDelay.get()}
                  onChange={(e) =>
                    controls.initialDelay.update(parseFloat(e.target.value))
                  }
                  min="0"
                  max="10"
                  step="0.5"
                  className="w-full"
                />
                <div className="text-xs text-gray-500 flex justify-between">
                  <span>0</span>
                  <span>{controls.initialDelay.get().toFixed(1)}s</span>
                  <span>10</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  Final Delay (s)
                </label>
                <input
                  type="range"
                  value={controls.finalDelay.get()}
                  onChange={(e) =>
                    controls.finalDelay.update(parseFloat(e.target.value))
                  }
                  min="0"
                  max="10"
                  step="0.5"
                  className="w-full"
                />
                <div className="text-xs text-gray-500 flex justify-between">
                  <span>0</span>
                  <span>{controls.finalDelay.get().toFixed(1)}s</span>
                  <span>10</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-400">Repeat</label>
                <input
                  type="checkbox"
                  checked={controls.repeat.get()}
                  onChange={(e) => controls.repeat.update(e.target.checked)}
                  className="w-4 h-4 bg-gray-800 border-gray-600 accent-green-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-gray-700/50 rounded-lg p-4">
            <h3 className="text-sm font-bold text-gray-200 mb-3">
              Display & Effects
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  Color
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {Object.keys(COLOR_PRESETS).map((colorName) => (
                    <button
                      key={colorName}
                      onClick={() =>
                        controls.color.update(
                          colorName as keyof typeof COLOR_PRESETS
                        )
                      }
                      className={`h-8 rounded transition-all ${
                        controls.color.get() === colorName
                          ? 'ring-2 ring-white scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{
                        backgroundColor: `rgb(${
                          COLOR_PRESETS[colorName as keyof typeof COLOR_PRESETS]
                            .r
                        }, ${
                          COLOR_PRESETS[colorName as keyof typeof COLOR_PRESETS]
                            .g
                        }, ${
                          COLOR_PRESETS[colorName as keyof typeof COLOR_PRESETS]
                            .b
                        })`,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-400">Stress Test</label>
                <input
                  type="checkbox"
                  checked={controls.stressTest.get()}
                  onChange={(e) => controls.stressTest.update(e.target.checked)}
                  className="w-4 h-4 bg-gray-800 border-gray-600 accent-green-500"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  Random Pixels: {controls.randomPixels.get()}
                </label>
                <input
                  disabled={!controls.stressTest.get()}
                  type="range"
                  value={controls.randomPixels.get()}
                  onChange={(e) =>
                    controls.randomPixels.update(parseInt(e.target.value))
                  }
                  min="0"
                  max="300"
                  step="10"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-gray-700/50 rounded-lg p-4">
            <h3 className="text-sm font-bold text-gray-200 mb-3">Stats</h3>
            <div className="space-y-1 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Lit pixels:</span>
                <span className="text-green-400 font-mono">
                  {stats.litPixels.get()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total logical pixels:</span>
                <span className="text-gray-500 font-mono">{TOTAL}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Logical dimensions:</span>
                <span className="text-gray-500 font-mono">
                  {WIDTH}×{HEIGHT}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Pixel Visual Size:</span>
                <span className="text-gray-500 font-mono">
                  {pixelScale.toFixed(1)}x
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Rendered Display Width:</span>
                <span className="text-gray-500 font-mono">
                  {(WIDTH * pixelScale).toFixed(1)}px
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Rendered Display Height:</span>
                <span className="text-gray-500 font-mono">
                  {(HEIGHT * pixelScale).toFixed(1)}px
                </span>
              </div>
            </div>
            <details className="text-xs">
              <summary className="text-gray-400 cursor-pointer hover:text-gray-300">
                View State (Cogs)
              </summary>
              <pre className="text-gray-300 overflow-auto max-h-32 bg-gray-900 rounded p-2 mt-2">
                {JSON.stringify(
                  {
                    controls: controls.get(),
                    stats: stats.get(),
                  },
                  null,
                  2
                )}
              </pre>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
