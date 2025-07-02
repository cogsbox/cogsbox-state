"use client";
import { useMemo, useEffect, useState } from "react";
// NEW: We need this to convert the SVG JSX into a string for the mask.
import { renderToStaticMarkup } from "react-dom/server";

interface PixelRainProps {
  numberOfDrops?: number;
}

export function PixelRain({ numberOfDrops = 200 }: PixelRainProps) {
  const [windStrength, setWindStrength] = useState(0);
  const [lightningFlash, setLightningFlash] = useState(false);
  const [lightningIntensity, setLightningIntensity] = useState(0);
  const [lightningSteps, setLightningSteps] = useState(8);
  const [skylineBrightness, setSkylineBrightness] = useState(1);
  useEffect(() => {
    let animationFrame: number;
    let startTime = Date.now();

    const updateWind = () => {
      const elapsed = (Date.now() - startTime) / 2000;
      const primaryWind = Math.sin(elapsed * 0.3) * 0.7;
      const secondaryWind = Math.sin(elapsed * 0.8) * 0.3;
      const tertiaryWind = Math.sin(elapsed * 1.2) * 0.1;
      const combinedWind = (primaryWind + secondaryWind + tertiaryWind) * 200;
      setWindStrength(combinedWind);
      animationFrame = requestAnimationFrame(updateWind);
    };

    updateWind();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  useEffect(() => {
    let fadeInterval: NodeJS.Timeout | undefined;
    let schedulerFrame: number;

    const triggerLightning = () => {
      if (fadeInterval) return;

      let currentIntensity = 0.2 + Math.random() * 0.3;
      let isLit = true;

      fadeInterval = setInterval(() => {
        currentIntensity *= 0.96;

        if (currentIntensity < 0.01) {
          setLightningFlash(false);
          setLightningIntensity(0);
          setSkylineBrightness(1);
          clearInterval(fadeInterval);
          fadeInterval = undefined;
        } else {
          const frameIntensity = isLit ? currentIntensity : 0.3;
          setLightningFlash(isLit);
          setLightningIntensity(frameIntensity);

          // Only update skyline brightness when lightning is visible
          if (isLit) {
            setSkylineBrightness(1 - currentIntensity * 0.5);
          }

          if (isLit) {
            const steps = Math.max(2, Math.floor(currentIntensity * 50));
            setLightningSteps(steps);
          }
        }
        isLit = !isLit;
      }, 40);
    };
    let lastTime = performance.now();
    let timeUntilNextStrike = 10000 + Math.random() * 1000;

    const lightningScheduler = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      timeUntilNextStrike -= deltaTime;

      if (timeUntilNextStrike <= 0) {
        triggerLightning();
        timeUntilNextStrike = 2000 + Math.random() * 10000;
      }

      schedulerFrame = requestAnimationFrame(lightningScheduler);
    };

    schedulerFrame = requestAnimationFrame(lightningScheduler);

    return () => {
      cancelAnimationFrame(schedulerFrame);
      if (fadeInterval) {
        clearInterval(fadeInterval);
      }
    };
  }, []);

  const steppedGradient = useMemo(() => {
    const steps = 30;
    const startColor = { r: 96, g: 110, b: 130 };
    const endColor = { r: 5, g: 5, b: 8 };
    let gradientSteps = [];
    const easeOutQuint = (t: number) => Math.pow(t, 4);
    for (let i = 0; i < steps; i++) {
      const colorProgress = i / (steps - 1);
      const r = Math.round(
        startColor.r + (endColor.r - startColor.r) * colorProgress
      );
      const g = Math.round(
        startColor.g + (endColor.g - startColor.g) * colorProgress
      );
      const b = Math.round(
        startColor.b + (endColor.b - startColor.b) * colorProgress
      );
      const positionStart = easeOutQuint(i / steps) * 100;
      const positionEnd = easeOutQuint((i + 1) / steps) * 100;
      gradientSteps.push(
        `rgb(${r}, ${g}, ${b}) ${positionStart}%`,
        `rgb(${r}, ${g}, ${b}) ${positionEnd}%`
      );
    }
    return `linear-gradient(180deg, ${gradientSteps.join(", ")})`;
  }, []);

  const lightningGradient = useMemo(() => {
    if (!lightningFlash || lightningIntensity === 0) return "transparent";
    const steps = lightningSteps;
    let gradientSteps = [];
    for (let i = 0; i < steps; i++) {
      const distance = i / (steps - 1);
      const opacity = (1 - distance) * lightningIntensity;
      const r = Math.round(255 - distance * 55);
      const g = Math.round(255 - distance * 35);
      const b = 255;
      const percentage = (i / steps) * 100;
      const nextPercentage = ((i + 1) / steps) * 100;
      gradientSteps.push(
        `rgba(${r}, ${g}, ${b}, ${opacity}) ${percentage}%`,
        `rgba(${r}, ${g}, ${b}, ${opacity}) ${nextPercentage}%`
      );
    }
    return `radial-gradient(ellipse 150vh 150vh at 90% -200px, ${gradientSteps.join(
      ", "
    )})`;
  }, [lightningFlash, lightningIntensity, lightningSteps]);

  // NEW: Convert the SVG component into a data URI string for use in CSS.
  // We wrap this in useMemo so it only runs once.
  const skylineMaskUri = useMemo(() => {
    // btoa is a browser-only function, so this confirms we're on the client.
    if (typeof window === "undefined") return "";
    const svgString = renderToStaticMarkup(skylineSVG);
    return `url("data:image/svg+xml;base64,${btoa(svgString)}")`;
  }, []);

  const drops = useMemo(() => {
    let drops = [];
    for (let i = 0; i < numberOfDrops; i++) {
      const randoHundo = Math.floor(Math.random() * 98) + 1;
      const animationDuration = 0.5 + randoHundo / 100;
      const endHeight = 40 + Math.random() * 90;
      drops.push({
        id: `drop-${i}`,
        left: `${Math.random() * 100}%`,
        animationDelay: `0.${randoHundo}s`,
        animationDuration: `${animationDuration}s`,
        endHeight: `${endHeight}vh`,
        windSensitivity: 0.5 + Math.random() * 0.5,
        opacity: 0.2 + ((endHeight - 40) / 90) * 0.7,
      });
    }
    return drops;
  }, [numberOfDrops]);

  return (
    <>
      {/* LAYER 1: The absolute base gradient. The very back layer. */}
      {/* NEW: z-index is now -4 to be at the very bottom. */}
      <div className="fixed inset-0 z-[-4]">
        <div
          className="pixel-gradient"
          style={{ background: steppedGradient, imageRendering: "pixelated" }}
        />
      </div>

      {/* LAYER 2: The lightning flash. */}
      {/* NEW: z-index is now -3 to be above the base gradient. */}
      <div
        style={{
          position: "fixed",
          top: "-400px",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -3, // Changed from -1
          pointerEvents: "none",
          background: lightningGradient,
          mixBlendMode: "screen",
          imageRendering: "pixelated",
        }}
      />

      {/* LAYER 3: The skyline. This is the new div. */}
      {/* NEW: This div uses the gradient as a background and the SVG as a mask. */}
      {/* It sits on top of the lightning, so the flash appears behind the city. */}
      {skylineMaskUri && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100vh",
            zIndex: -1,
            pointerEvents: "none",
            filter: `brightness(${Math.min(skylineBrightness, 0.7)})`,
            background: steppedGradient,
            backgroundAttachment: "fixed",
            imageRendering: "pixelated",
            maskImage: skylineMaskUri,
            maskSize: "100% 100%",
            maskRepeat: "no-repeat",
          }}
        />
      )}

      {/* LAYER 4: The rain. Its z-index is -1 (from CSS), so it's the top-most background layer. */}
      <div
        aria-hidden="true"
        className="pixel-rain-container"
        style={
          { "--wind-strength": `${windStrength}px` } as React.CSSProperties
        }
      >
        {drops.map((drop) => (
          <div key={drop.id}>
            <div
              className="pixel-drop"
              style={
                {
                  left: drop.left,
                  "--delay": drop.animationDelay,
                  "--drop-opacity": drop.opacity,
                  "--duration": drop.animationDuration,
                  "--end-height": drop.endHeight,
                  "--wind-sensitivity": drop.windSensitivity,
                } as any
              }
            >
              <div className="pixel-stem" />
            </div>
            <div
              className="pixel-splat"
              style={
                {
                  left: drop.left,
                  "--delay": drop.animationDelay,
                  "--drop-opacity": drop.opacity,
                  "--duration": drop.animationDuration,
                  "--end-height": drop.endHeight,
                  "--splat-duration": `${
                    parseFloat(drop.animationDuration) * 2
                  }`,
                } as any
              }
            />
          </div>
        ))}
      </div>
    </>
  );
}

// Your SVG and CSS remain unchanged.
// At the bottom of your file, make sure skylineSVG looks exactly like this:
const skylineSVG = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    id="Graphic_Elements"
    data-name="Graphic Elements"
    // Adjusted viewBox to include more vertical space
    viewBox="0 480 1200 730"
    preserveAspectRatio="none"
  >
    {/* Original city skyline path */}
    <path d="M0,654.71H14.33v11.93h3.34V654.71h6.4V654H21.62v-.7H29.3V620.34h5.53v-2.06h-4.2v-4.57h4.2V609H37v-9.16h13.7v1.46H47.73v2.07h2.94V607H51.9v2.66h5.33v16.67h2.84V601.44H67.5v-2.53h3.13v-1.43h-4.7v-.77h4.7V595H62.17v-1.5h14.4v-14l13-29v-8.9h.93v9l11,28.5v28.37h-1.1v21.73h5.87L109,619l4.3-5.6,2,2v-8.68h.41v5h2.6v-4.46h.6v8.63l2.47,14.7h7.77v16.14h2.16V603.31h1.54V546l5.4-14.63V512.54h.56v9h1.27v6.57l1.6-2.54v-3.7l2.47-2.46,2.9,2.1v4.33L155,546l.4,70.4,1.23-2.13,1.8,2.53v-8.17l.87.07v4.67h2.13v-4.47h.73v10h2v11.5H182v34.43h3V543h7.23V563l2.45-2.45h3l3.37,16.89a5.46,5.46,0,0,1,1.57,7.53v3.87h3.83v1.63h7.83v24.27h3.94l3-66.07h5.66v-12.6H228v-2.47h25.87v-7.8h.93v4.6h.9v1.64h.4v-1.5h.63v-1h1.5v.87h.8v3.36h10.4v1.54h1.4v12.53h4.8v12.47h19.9V589h.57s.13-2.9,5.67-2.9v-29.7L305.1,546v-1.9s1.2-1.86,3.07,0v2.1h.7v-6.86h1.26v9.13l2.77,7.9v29s5.73.54,7.87,2.67v16.77h5.4v-12.5s-.54-5.85,5.85-5.85v-6.39h1.41v6.39s5.85,0,5.85,5.85v11.53h2.79v.7h4v2h-1.5v39.73h3.63v3h1.13V654h2.5v9h.8v-.93h2.87V660h11s.6,3.2,1.9,3.2h7.5v8.57l5.67,2.4V631.91h7l5.8,10.3v-50.5h13.4v32l9.43-14.93v-3.43H418v2.86h.83v-2.1h.8V638l6.5,8.84,1.4-2.17h2.73V610.44h2.67V598h8v-1.4h1.3v1.5h3.7v1H447V597l3-3.7V580.21h.9v-5.5h3.93v5.43h2.67V577H470.4v4h7v49.07l5.24.86V624H500V612.24h3.64v-10h1.73V598h1.93v-5.73H518.1v5.33h2.5v4.27h1.13v1.33h1v2h1.43V604h5.7l2.2-2.2v-4.3h1.3v-4.2h2.24v1.2h1.63v-1.66H540v5.7h2.27v4.6l1.59,1.58v8.38h2.78v37.34l2.8-16.25,32,9.69v25.6h9.25V636.37h4.15v-2.5l5.25-9.54v-5.55l3.82-3.83h.63v-6.17h.7V615l3.77,3.77h1.28V624l5.45,10h1v1.56h2.5V646l10.2,4.2V620.73h5.5V608.28s-.9-6,6-6v-6.4h.85v6.4s5.4-.7,5.4,6v11.3l4-4.65v-3.75h1V595.43l12.7-29.2v-8.3h1v8.3l10.8,28v10.85h1.8V577h19.81v-13.2H704V551.61h.84V550h4v-2.07h.73v2h4.87V520.18l5.93-14.9V487H721v8.73h.8v7l1.7-2.77v-3.13s-.43-2.14,2.87-2.14,2.66,2.1,2.66,2.1v3.77l8,19.67v30.1h8.7v2h1.34V565h5.43l3.4,65.94h4.23V606.61h7.6v-1.8h3.1v-4.33s-2.31-2.92,0-5.24l2-2,3.58-17.18h3.17l1.76,3h1V559.31h7.07v98.47h2.33V646.51h18.13V635.84l2.14-2.46V625h.53v4.6h2.27v-4.2h.9v7.4s.4-1.74,1.36-1.74,1.34,2.07,1.34,2.07V553.64a27.6,27.6,0,0,1,4-16.6s.72-5.45,3.67-8.4v-4.16a3.09,3.09,0,0,1,2.63-1.74,2.75,2.75,0,0,1,2.5,1.34v4.13l1.67,2.4v-6.77h1.43v-8.7h1v19.64s4.3,7.66,4.8,13.06v71.37h2.47v38.27h2.3v-11.3h9.5v-51.7l1.3,1.3V601l.52.52v3.08h7.33V621h2v-43.3h1.85V520.28s1.9-9.35,5.55-14.65l-.9-1.1V487h.9v8.7h1.45v6.75l2-2v-3.8s.1-1.8,2.65-1.8,2.55,2,2.55,2v3.6l1.15,1.6v-6.8h.8v7.6l13.1,30.35v60.35l1.8,4.5v7H916.8v33.66l2.2-13.26V517.71h7.53V537l1.9-1.9h3.43l3.87,16.77s4.53,2.93,1.33,7.53v3.67h3.34v2h8.06v24.33h4.6L956,523.31h4.86V510.78h1.47v-2.87h41.33V510h1.54v12.13h4.73v13.13h20V563s1.8-3.13,11.8-3.13v-6.4h1.33v6.13a23.87,23.87,0,0,1,12.14,2.54v17.4h2.46v-1.87h3.47V565.64s1.53-4.66,5.27-4.66v-6.54h1.73v7.2s5.17,2.14,5.17,5.17v11.57h7.1v2.18h-1.14v40.15h3.27v2.4h1.67v6.27h1.4v8.13l5.33-2.53h9.8s.13,2.66,2.13,2.66h7.4v8.2l6,2.8V606.31h6.6l6.2,10.4v-50.4h3.8v-1.2h6.34v1.4h3.26v31.8l5.27-8.73h6.8v22.2l6.27,11,1.06-3.67h2.6v-34.4h3.2V572.38h13.87l3.27-3.27V554.78h6.66v-3.4h4.2V556h1.2v-4H1200V800H0Z" />

    {/* New rectangular path that extends the mask downward */}
    <rect x="0" y="670" width="1200" height="480" fill="black" />
  </svg>
);
