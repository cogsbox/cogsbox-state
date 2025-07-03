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

      const subtleX = 15;
      const subtleY = 120;
      const baseIntensity = 0.9 + Math.random() * 0.1;
      const steps = 20; // Clear distinct bands
      let gradientSteps = [];

      const glowStartRadius = 4.3;

      moonCircleRef.current.style.left = `${subtleX}%`;
      moonCircleRef.current.style.top = `${subtleY}px`;

      for (let i = 0; i < steps; i++) {
        const t = i / (steps - 1);
        const radiusStart = glowStartRadius + Math.pow(t, 6) * 100;
        const radiusEnd =
          glowStartRadius + Math.pow((i + 1) / (steps - 1), 2) * 30;

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

      moonRef.current.style.background = `radial-gradient(circle 180vh at ${subtleX}% ${subtleY}px, transparent ${glowStartRadius}vh, ${gradientSteps.join(
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
          zIndex: -3,
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
          backgroundColor: "rgba(215, 215, 215, 0.8)",
          zIndex: -3,
          pointerEvents: "none",
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
    const BASE_SKYLINE_BRIGHTNESS = 0.1;

    const triggerLightning = () => {
      if (fadeInterval) return;

      let currentIntensity = 0.2 + Math.random() * 0.2;
      let isLit = true;

      fadeInterval = setInterval(() => {
        currentIntensity *= 0.96;

        if (currentIntensity < 0.01) {
          // Reset
          if (lightningRef.current) {
            lightningRef.current.style.background = "transparent";
          }
          onBrightnessChange(BASE_SKYLINE_BRIGHTNESS);
          clearInterval(fadeInterval as NodeJS.Timeout);
          fadeInterval = undefined;
        } else {
          const intensity = isLit ? currentIntensity : currentIntensity * 0.3;

          if (lightningRef.current) {
            const randomX = 95 + Math.random() * 10;
            const randomY = -10 + Math.random() * 100;
            const randomWidth = 120 + Math.random() * 60;
            const randomHeight = 120 + Math.random() * 60;

            const steps = 8;
            let gradientSteps = [];
            for (let i = 0; i < steps; i++) {
              const distance = i / (steps - 1);
              const opacity = (1 - distance) * intensity;
              const r = Math.round(
                255 - distance * 55 + (Math.random() - 0.5) * 20
              );
              const g = Math.round(
                255 - distance * 35 + (Math.random() - 0.5) * 15
              );
              const b = 255;
              const percentage = (i / steps) * 100;
              const nextPercentage = ((i + 1) / steps) * 100;
              gradientSteps.push(
                `rgba(${r}, ${g}, ${b}, ${opacity}) ${percentage}%`,
                `rgba(${r}, ${g}, ${b}, ${opacity}) ${nextPercentage}%`
              );
            }

            lightningRef.current.style.background = `radial-gradient(ellipse ${randomWidth}vh ${randomHeight}vh at ${randomX}% ${randomY}vh, ${gradientSteps.join(
              ", "
            )})`;
          }

          const brightness = isLit
            ? Math.max(0.2, BASE_SKYLINE_BRIGHTNESS - currentIntensity * 0.5)
            : BASE_SKYLINE_BRIGHTNESS - currentIntensity * 0.3 * 0.5;

          onBrightnessChange(brightness);
        }

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
        zIndex: -3,
        pointerEvents: "none",
        background: "transparent",
        mixBlendMode: "screen",
        imageRendering: "pixelated",
      }}
    />
  );
}

export function PixelRain({ numberOfDrops = 120 }: PixelRainProps) {
  const [skylineBrightness, setSkylineBrightness] = useState(0.5);
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

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!window) return;
      const { clientX, clientY } = event;
      const { innerWidth, innerHeight } = window;
      const xOffset = (clientX - innerWidth / 2) / innerWidth;
      const yOffset = (clientY - innerHeight / 2) / innerHeight;

      const applyTransform = (
        ref: React.RefObject<HTMLElement>,
        strength: number,
        preserveExistingTransform: string = ""
      ) => {
        if (ref.current) {
          const x = xOffset * strength;
          const y = yOffset * strength;
          ref.current.style.transform = `${preserveExistingTransform} translate(${x}px, ${y}px) scale(1)`;
        }
      };

      applyTransform(skylineRef, 0);
      // The blimp needs to preserve its translateX animation
      applyTransform(blimpRef, 15, "translateX(-100%)");

      applyTransform(cybermanRef, 30);
      applyTransform(rainContainerRef, 45);
      applyTransform(splatContainerRef, 45);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  // --- END: Parallax Logic ---

  const steppedGradient = useMemo(() => {
    const steps = 40;
    const startColor = { r: 85, g: 105, b: 135 };
    const endColor = { r: 0, g: 0, b: 0 };
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
        `rgb(${r}, ${g}, ${b}) ${posStart}%`,
        `rgb(${r}, ${g}, ${b}) ${posEnd}%`
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
      const densityWeight = Math.pow(Math.random(), 12); // Squares the random value, biasing toward 0
      const eH = 40 + densityWeight * 100; // 40-140vh, but more clustered near 40

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
      <div className="fixed inset-0 z-[-4]">
        <div
          className="pixel-gradient"
          style={{
            background: steppedGradient,
            imageRendering: "pixelated",
            position: "absolute",
            inset: -10,
            zIndex: -50,
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
        className="fixed bottom-[10vh] left-[20vh] z-[-1]  h-[500px]"
      >
        <img src="./cyberman.png" alt="Hero background" className="h-[500px]" />
      </div>
      {/* Static Overlays - UNCHANGED */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          height: "37%",
          zIndex: -4,
          pointerEvents: "none",
          background:
            "linear-gradient(to top, rgba(255, 120, 70, 0.2) 15%, transparent 37%)",
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
            "linear-gradient(to top, rgba(255, 120, 70, 0.0) 0%,rgba(255, 120, 30, 0.2) 45%,rgba(255, 120, 70, 0.005) 80%, rgba(255, 120, 70, 0.0) 100%,transparent 37%)",
        }}
      />
      <CloudLayers lightningBrightness={skylineBrightness} />
      <div className="fixed top-[30vh] inset-0 text-gradient-to-b from-black/05 via-black to-black/05 w-full h-[40vh] z-[-3]" />
      {/* Blimp Layer */}
      <div
        ref={blimpRef}
        className="fixed top-[21vh] z-[-4] "
        style={{
          animation: "moveAcross 240s linear infinite",
          transform: "translateX(-100%)",
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
          zIndex: -3,
          pointerEvents: "none",
          filter: `brightness(${
            0.6 + (skylineBrightness + moonIntensity * 0.00002)
          })`,
          background: steppedGradient,
          backgroundAttachment: "fixed",
          imageRendering: "pixelated",
          maskImage: "url(/skyline.svg)",
          maskSize: "100% 100vh",
          maskPosition: "0 5vh",
          maskRepeat: "no-repeat",
        }}
      />{" "}
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
