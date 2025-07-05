import { useEffect, useRef, useState } from "react";

const WIDTH = 96;
const HEIGHT = 24;
const TOTAL = WIDTH * HEIGHT;

type Props = {
  svg: string; // inline SVG string (e.g. from <svg>...</svg>)
  speed?: number; // pixels/frame
  scale?: number; // visual scaling multiplier
};

export default function LCDCatScroller({ svg, speed = 1, scale = 4 }: Props) {
  const [pixels, setPixels] = useState<Uint8Array>(() => new Uint8Array(TOTAL));
  const [cat, setCat] = useState<Uint8Array | null>(null);
  const [catWidth, setCatWidth] = useState(0);
  const frameRef = useRef(0);

  useEffect(() => {
    const rasterizeSvgToGrid = async (
      svgString: string,
      width: number,
      height: number
    ): Promise<{ data: Uint8Array; w: number }> => {
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      // CHANGE 1: Specify the image dimensions in the constructor.
      // This is crucial for the browser to correctly render the SVG at the desired size.
      const img = new Image(width, height);

      const p = new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      img.src = url;

      await p;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const imageData = ctx.getImageData(0, 0, width, height).data;
      const out = new Uint8Array(width * height);

      // CHANGE 2: Calculate the *actual* width of the rendered graphic.
      // We will scan the pixels to find the right-most "on" pixel.
      let actualWidth = 0;

      for (let i = 0; i < width * height; i++) {
        const [r, g, b, a] = [
          imageData[i * 4],
          imageData[i * 4 + 1],
          imageData[i * 4 + 2],
          imageData[i * 4 + 3],
        ];
        // Check if the pixel is not transparent and is dark.
        if (a > 128 && (r + g + b) / 3 < 128) {
          out[i] = 255;
          const x = i % width; // get the x-coordinate of the pixel
          if (x > actualWidth) {
            actualWidth = x;
          }
        } else {
          out[i] = 0;
        }
      }

      URL.revokeObjectURL(url);
      // Return the detected width (+1 because it's an index)
      return { data: out, w: actualWidth + 1 };
    };

    // The rest of your component logic depends on the rasterization being correct.
    // The SVG is squished into 96x24 to fit the "LCD" screen.
    rasterizeSvgToGrid(svg, WIDTH, HEIGHT).then(({ data, w }) => {
      setCat(data);
      setCatWidth(w);
    });
  }, [svg]);

  useEffect(() => {
    if (!cat || catWidth === 0) return; // Don't start if cat isn't ready
    let raf: number;
    const buffer = new Uint8Array(TOTAL);
    const fade = 0.92;

    const drawAt = (xOffset: number) => {
      for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < catWidth; x++) {
          const src = y * catWidth + x; // Use catWidth for source index
          const dstX = Math.round(x + xOffset);
          if (dstX >= 0 && dstX < WIDTH) {
            const dst = y * WIDTH + dstX;
            if (cat[y * WIDTH + x]) {
              // Check source from the full-width grid
              buffer[dst] = 255;
            }
          }
        }
      }
    };

    const loop = () => {
      const frame = frameRef.current++;
      for (let i = 0; i < TOTAL; i++) {
        buffer[i] = Math.floor(buffer[i] * fade);
      }

      const scrollDistance = WIDTH + catWidth;
      const offset = ((frame * speed) % scrollDistance) - catWidth;
      drawAt(offset);
      setPixels(new Uint8Array(buffer));
      raf = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(raf);
  }, [cat, catWidth, speed]);

  return (
    <div
      className="grid bg-black crt"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${WIDTH}, ${scale}px)`,
        width: WIDTH * scale,
      }}
    >
      {Array.from(pixels).map((val, i) => (
        <div
          key={i}
          style={{
            backgroundColor: `rgb(0, ${val}, 0)`,
            width: `${scale}px`,
            aspectRatio: "1 / 1",
          }}
        />
      ))}
    </div>
  );
}
