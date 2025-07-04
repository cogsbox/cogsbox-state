"use client";
import { useMemo, useState, useCallback, useEffect, useRef } from "react";

// Assuming these are in separate files as in your original code
import FlyingCars from "./FlyingCars";
import BlimpWithSpotlights from "./Blimp";

import { CloudTiles, CloudLayers } from "./CloudTiler";

interface PixelRainProps {
  numberOfDrops?: number;
}

interface LightningProps {
  onBrightnessChange: (brightness: number) => void;
}
function MoonGlow({
  onMoonIntensityChange,
}: {
  onMoonIntensityChange: (intensity: number) => void;
}) {
  const moonRef = useRef<HTMLDivElement>(null);
  const moonCircleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let glowInterval: NodeJS.Timeout;

    const updateMoonGlow = () => {
      if (!moonRef.current || !moonCircleRef.current) return;

      const subtleX = 16;
      const subtleY = 8;
      const baseIntensity = 0.5 + Math.random() * 0.02;
      const steps = 16; // Clear distinct bands
      let gradientSteps = [];

      const glowStartRadius = 4.3;

      moonCircleRef.current.style.left = `${subtleX}vw`;
      moonCircleRef.current.style.top = `${subtleY}vh`;

      for (let i = 0; i < steps; i++) {
        const t = i / (steps - 1);
        const radiusStart = glowStartRadius + Math.pow(t, 6) * 100;
        const radiusEnd =
          glowStartRadius +
          Math.pow((i + 1) / (steps - 1), 2) * 43 * baseIntensity;

        const opacity = baseIntensity * (1 - t) * 0.4;

        const r = 200;
        const g = 210;
        const b = 220;

        // Hard band: same color from start to end of this band
        gradientSteps.push(
          `rgba(${r}, ${g}, ${b}, ${opacity}) ${radiusStart}vh`
        );
        gradientSteps.push(`rgba(${r}, ${g}, ${b}, ${opacity}) ${radiusEnd}vh`);
      }

      onMoonIntensityChange(baseIntensity * 0.3);

      moonRef.current.style.background = `radial-gradient(circle 180vh at ${subtleX}vw ${subtleY}vh, transparent ${glowStartRadius}vh, ${gradientSteps.join(
        ", "
      )})`;
    };
    glowInterval = setInterval(updateMoonGlow, 400);
    updateMoonGlow();

    return () => {
      clearInterval(glowInterval);
    };
  }, []);

  return (
    <>
      <div
        ref={moonRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -5,
          pointerEvents: "none",
          background: "transparent",
          mixBlendMode: "screen",
          imageRendering: "pixelated",
        }}
      />

      <div
        ref={moonCircleRef}
        style={{
          position: "fixed",
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          backgroundColor: "rgba(195, 195, 195, 0.9)",
          zIndex: -5,
          pointerEvents: "none",
          filter: "blur(1px)",
          transform: "translate(-50%, -50%)",
          imageRendering: "pixelated",
        }}
      />
    </>
  );
}
function Lightning({ onBrightnessChange }: LightningProps) {
  const lightningRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let fadeInterval: NodeJS.Timeout | undefined;
    let schedulerTimeout: NodeJS.Timeout;
    const BASE_SKYLINE_BRIGHTNESS = 1.0; // Normal brightness

    const triggerLightning = () => {
      if (fadeInterval) return;

      let currentIntensity = 0.2 + Math.random() * 0.2;
      let isLit = true;

      fadeInterval = setInterval(() => {
        // Decay the overall intensity of the flash over time
        currentIntensity *= 0.96;

        if (currentIntensity < 0.01) {
          // --- Reset after the lightning has faded ---
          if (lightningRef.current) {
            lightningRef.current.style.background = "transparent";
          }
          onBrightnessChange(BASE_SKYLINE_BRIGHTNESS); // Reset to normal brightness
          clearInterval(fadeInterval as NodeJS.Timeout);
          fadeInterval = undefined;
        } else {
          // --- Render the current frame of the lightning ---
          const intensity = isLit ? currentIntensity : currentIntensity * 0.3;

          if (lightningRef.current) {
            const randomX = 95 + Math.random() * 10;
            const randomY = -10 + Math.random() * 100;
            const randomWidth = 120 + Math.random() * 60;
            const randomHeight = 120 + Math.random() * 60;

            // --- THIS IS THE EFFICIENT & SMOOTH GRADIENT ---
            // We define only two points: the bright center and the transparent edge.
            // The browser creates a perfectly smooth gradient between them.
            const centerColor = `rgba(255, 255, 255, ${intensity})`; // Bright, slightly blue-white at the core
            const edgeColor = `rgba(200, 220, 255, 0)`; // Fades to a transparent atmospheric blue

            // The gradient stops at 70% to create a softer, more natural falloff
            // instead of a hard edge at 100%.
            const gradient = `radial-gradient(ellipse ${randomWidth}vh ${randomHeight}vh at ${randomX}% ${randomY}vh, ${centerColor} 0%, ${edgeColor} 70%)`;

            lightningRef.current.style.background = gradient;
            // --- END OF THE CHANGE ---
          }

          // During lightning, adjust the main scene brightness based on intensity
          const brightness = isLit
            ? Math.max(0.3, BASE_SKYLINE_BRIGHTNESS - currentIntensity * 0.7)
            : BASE_SKYLINE_BRIGHTNESS - currentIntensity * 0.3;

          onBrightnessChange(brightness);
        }

        // Flicker between bright and dim states
        isLit = !isLit;
      }, 60);
    };

    const scheduleLightning = () => {
      const delay = 8000 + Math.random() * 12000;
      schedulerTimeout = setTimeout(() => {
        triggerLightning();
        scheduleLightning();
      }, delay);
    };

    scheduleLightning();

    return () => {
      clearTimeout(schedulerTimeout);
      if (fadeInterval) {
        clearInterval(fadeInterval);
      }
    };
  }, [onBrightnessChange]);

  return (
    <div
      ref={lightningRef}
      style={{
        position: "fixed",
        top: "-400px",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -5, // Changed from -3 to -5 to be behind skylines
        pointerEvents: "none",
        background: "transparent",
        mixBlendMode: "screen",
        imageRendering: "pixelated",
      }}
    />
  );
}

export function PixelRain({ numberOfDrops = 120 }: PixelRainProps) {
  const [skylineBrightness, setSkylineBrightness] = useState(1.0); // Start at normal brightness
  const [moonIntensity, setMoonIntensity] = useState(0);
  const handleBrightnessChange = useCallback((brightness: number) => {
    setSkylineBrightness(brightness);
  }, []);

  // --- START: Parallax Logic ---
  const carsRef = useRef<HTMLDivElement>(null);
  const cybermanRef = useRef<HTMLDivElement>(null);
  const blimpRef = useRef<HTMLDivElement>(null);
  const skylineRef = useRef<HTMLDivElement>(null);
  const rainContainerRef = useRef<HTMLDivElement>(null);
  const splatContainerRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   const handleMouseMove = (event: MouseEvent) => {
  //     if (!window) return;
  //     const { clientX, clientY } = event;
  //     const { innerWidth, innerHeight } = window;
  //     const xOffset = (clientX - innerWidth / 2) / innerWidth;
  //     const yOffset = (clientY - innerHeight / 2) / innerHeight;

  //     const applyTransform = (
  //       ref: React.RefObject<HTMLElement>,
  //       strength: number,
  //       preserveExistingTransform: string = ""
  //     ) => {
  //       if (ref.current) {
  //         const x = xOffset * strength;
  //         const y = yOffset * strength;
  //         ref.current.style.transform = `${preserveExistingTransform} translate(${x}px, ${y}px) scale(1)`;
  //       }
  //     };

  //     applyTransform(skylineRef, 0);
  //     // The blimp needs to preserve its translateX animation
  //     applyTransform(blimpRef, 15, "translateX(-100%)");

  //     applyTransform(cybermanRef, 30);
  //     applyTransform(rainContainerRef, 3);
  //     applyTransform(splatContainerRef, 45);
  //   };

  //   window.addEventListener("mousemove", handleMouseMove);
  //   return () => window.removeEventListener("mousemove", handleMouseMove);
  // }, []);
  // --- END: Parallax Logic ---

  const steppedGradient = useMemo(() => {
    const steps = 40;
    const startColor = { r: 25, g: 60, b: 75 };
    const endColor = { r: 0, g: 0, b: 0 };
    const opacity = 0.8;
    let gradientSteps = [];
    const easeOutQuint = (t: number) => Math.pow(t, 8);
    for (let i = 0; i < steps; i++) {
      const p = i / (steps - 1);
      const r = Math.round(startColor.r + (endColor.r - startColor.r) * p);
      const g = Math.round(startColor.g + (endColor.g - startColor.g) * p);
      const b = Math.round(startColor.b + (endColor.b - startColor.b) * p);
      const posStart = i === 0 ? 0 : easeOutQuint(i / steps) * 100;
      const posEnd =
        i === steps - 1 ? 100 : easeOutQuint((i + 1) / steps) * 100;
      gradientSteps.push(
        `rgba(${r}, ${g}, ${b}, ${opacity}) ${posStart}%`,
        `rgba(${r}, ${g}, ${b}, ${opacity}) ${posEnd}%`
      );
    }
    return `linear-gradient(180deg, ${gradientSteps.join(", ")})`;
  }, []);

  const drops = useMemo(() => {
    let drops = [];
    for (let i = 0; i < numberOfDrops; i++) {
      const rH = Math.floor(Math.random() * 98) + 1;
      const aD = 0.5 + rH / 100;

      // Use weighted random for 3D effect - bias toward shorter falls (higher density up top)
      const densityWeight = Math.pow(Math.random(), 4); // Squares the random value, biasing toward 0
      const eH = 60 + densityWeight * 100; // 40-140vh, but more clustered near 40

      const sizeModifier = ((eH - 40) / 90) * 2;
      drops.push({
        id: `drop-${i}`,
        left: `${Math.random() * 100}%`,
        animationDelay: `0.${rH}s`,
        animationDuration: `${aD}s`,
        endHeight: `${eH}vh`,
        windSensitivity: 0.5 + Math.random() * 0.5,
        opacity: 0.4 + ((eH - 40) / 90) * 0.3,
        sizeModifier: sizeModifier,
      });
    }
    return drops;
  }, [numberOfDrops]);
  return (
    <>
      {/* Background elements - UNCHANGED */}
      <div className="fixed inset-0 z-[-5] background-gradient-masked">
        {" "}
        {/* <-- Class is moved here */}
        <div
          className="pixel-gradient" // <-- Class is removed from here
          style={{
            background: steppedGradient,
            imageRendering: "pixelated",
            position: "absolute",
            inset: -10,
            opacity: 0.6,
          }}
        />
      </div>
      <MoonGlow onMoonIntensityChange={setMoonIntensity} />
      <Lightning onBrightnessChange={handleBrightnessChange} />
      {/* --- Parallax Layers (Just adding a ref to your existing elements) --- */}
      {/* Cars Layer */}
      <div ref={carsRef} className="fixed inset-0 z-[-4]">
        <FlyingCars numberOfCars={50} />
      </div>{" "}
      <div
        ref={cybermanRef}
        className="fixed bottom-[20vh] left-[20vh] z-[-1]  h-[500px]"
      >
        <img src="./cyberman.png" alt="Hero background" className="h-[500px]" />
      </div>{" "}
      <div className="fixed bottom-[2vh] left-[50vw] z-[-1]  h-[25vh]">
        {" "}
        <div
          className="absolute bottom-[-100px] left-[-50px] w-[200px] h-[200px] "
          style={{
            background:
              "radial-gradient(circle at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0.01) 80%,  rgba(0,0,0,0.0) 100%)",
          }}
        ></div>
        <img src="./cat.png" alt="Hero background" className="h-[400px]" />{" "}
      </div>
      {/* Static Overlays - UNCHANGED */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          height: "39%",
          zIndex: -5,
          pointerEvents: "none",
          background:
            "linear-gradient(to top, rgba(255, 120, 70, 0.15) 25%, transparent 67%)",
        }}
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          top: "9vh",
          height: "32%",
          zIndex: -3,
          pointerEvents: "none",
          background:
            "linear-gradient(to top, rgba(255, 120, 70, 0.2) 10%, transparent 67%)",
        }}
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          top: "22%",
          height: "60%",
          filter: "blur(20px)",
          zIndex: -2,
          pointerEvents: "none",
          background:
            "linear-gradient(to top, rgba(255, 120, 70, 0.0) 0%,rgba(255, 120, 30, 0.08) 45%,rgba(255, 120, 70, 0.005) 80%, rgba(255, 120, 70, 0.0) 100%,transparent 37%)",
        }}
      />
      <CloudLayers lightningBrightness={skylineBrightness} />
      {/* Blimp Layer */}
      <div
        ref={blimpRef}
        className="fixed top-[23vh] z-[-4] "
        style={{
          animation: "moveAcross 240s linear infinite",
          transform: "translateX(-100%)",
          filter: " contrast(1.1)",
        }}
      >
        <BlimpWithSpotlights />
      </div>
      <style>{`@keyframes moveAcross { from { transform: translateX(-100%); } to { transform: translateX(100vw); }}`}</style>
      {/* Skyline Layer */}
      <div
        ref={skylineRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100vh",
          zIndex: -5,
          pointerEvents: "none",

          imageRendering: "pixelated",
        }}
      >
        {/* Solid background for the skyline shape */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: steppedGradient,
            filter: `brightness(${
              0.6 * skylineBrightness + moonIntensity * 0.02
            }) contrast(0.97) saturate(0.8)`,
            maskImage: "url(/skyline.svg)",
            maskSize: "100% 100vh",
            maskPosition: "0 -2vh",
            maskRepeat: "no-repeat",
          }}
        />

        {/* Additional opaque layer to block clouds */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: -5,
            background: "rgba(0, 0, 0, 0.85)", // Semi-opaque black
            maskImage: "url(/skyline.svg)",
            maskSize: "100% 100vh",
            maskPosition: "0 -2vh",
            maskRepeat: "no-repeat",
          }}
        />
      </div>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100vh",
          zIndex: -3,
          pointerEvents: "none",
          filter: `brightness(${
            1 + (1 - skylineBrightness + moonIntensity * 0.02)
          }) contrast(0.93) saturate(0.88)`, // Darker: 0.6 instead of 0.8
          background: "black",
          backgroundAttachment: "fixed",
          imageRendering: "pixelated",
          transform: "scaleX(-1)", // Flips horizontally
          maskImage: "url(/skyline.svg)",
          maskSize: "100% 60vh", // Less tall: 80vh instead of 100vh
          maskPosition: "0 20vh", // Lower: 25vh instead of 5vh
          maskRepeat: "no-repeat",
        }}
      />{" "}
      <div className="fixed top-[26vh] inset-0 bg-gradient-to-b from-black/05 via-black to-black/05 w-full h-[50vh] z-[-3]" />
      {/* Rain Layers */}
      <div
        ref={rainContainerRef}
        aria-hidden="true"
        className="pixel-rain-container"
      >
        {drops.map((drop) => (
          <div
            key={drop.id}
            className="pixel-raindrop"
            style={
              {
                left: drop.left,
                "--delay": drop.animationDelay,
                "--drop-opacity": drop.opacity,
                "--duration": drop.animationDuration,
                "--end-height": drop.endHeight,
              } as any
            }
          />
        ))}
      </div>
      <div
        ref={splatContainerRef}
        aria-hidden="true"
        className="pixel-splat-container"
      >
        {drops.map((drop) => (
          <div
            key={`splat-${drop.id}`}
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
                }s`,
                "--size-modifier": drop.sizeModifier, // ADD THIS LINE
              } as any
            }
          />
        ))}
      </div>
    </>
  );
}
