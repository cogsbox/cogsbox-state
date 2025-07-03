"use client";
import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import FlyingCars from "./FlyingCars";

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
      const baseIntensity = 1 + Math.random() * 0.2;
      const steps = 40;
      let gradientSteps = [];
      const moonCurve = (t: number) => Math.pow(t, 25); // Really quick drop-off

      // Update moon circle position
      moonCircleRef.current.style.left = `${subtleX}%`;
      moonCircleRef.current.style.top = `${subtleY}px`;

      for (let i = 0; i < steps; i++) {
        const distance = i / (steps - 1);
        const easedDistance = moonCurve(distance);

        // Start with moon intensity, drop off quickly
        const opacity = i === 0 ? 0.9 : (1 - easedDistance) * baseIntensity;
        const r = 195; // Match moon gray
        const g = 195; // Match moon gray
        const b = 195; // Match moon gray

        const positionStart = i === 0 ? 0 : moonCurve(i / steps) * 100;
        const positionEnd =
          i === steps - 1 ? 100 : moonCurve((i + 1) / steps) * 100;

        gradientSteps.push(
          `rgba(${r}, ${g}, ${b}, ${opacity}) ${positionStart}%`,
          `rgba(${r}, ${g}, ${b}, ${opacity}) ${positionEnd}%`
        );
      }

      onMoonIntensityChange(baseIntensity * 0.4);

      moonRef.current.style.background = `radial-gradient(circle ${
        150 + baseIntensity * 20
      }vh at ${subtleX}% ${subtleY}px, ${gradientSteps.join(", ")})`;
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
          zIndex: -4,
          pointerEvents: "none",
          background: "transparent",
          mixBlendMode: "soft-light",
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
    const BASE_SKYLINE_BRIGHTNESS = 0.5;

    const triggerLightning = () => {
      if (fadeInterval) return;

      let currentIntensity = 0.4 + Math.random() * 0.3;
      let isLit = true;

      fadeInterval = setInterval(() => {
        currentIntensity *= 0.96;

        if (currentIntensity < 0.01) {
          // Reset
          if (lightningRef.current) {
            lightningRef.current.style.background = "transparent";
          }
          onBrightnessChange(BASE_SKYLINE_BRIGHTNESS);
          clearInterval(fadeInterval);
          fadeInterval = undefined;
        } else {
          const intensity = isLit ? currentIntensity : currentIntensity * 0.3;

          // Update DOM directly - no useState!
          if (lightningRef.current) {
            const randomX = 85 + Math.random() * 10;
            const randomY = -250 + Math.random() * 100;
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

            lightningRef.current.style.background = `radial-gradient(ellipse ${randomWidth}vh ${randomHeight}vh at ${randomX}% ${randomY}px, ${gradientSteps.join(
              ", "
            )})`;
          }

          const brightness = isLit
            ? Math.max(0.2, BASE_SKYLINE_BRIGHTNESS - currentIntensity * 0.5)
            : BASE_SKYLINE_BRIGHTNESS - currentIntensity * 0.3 * 0.5;

          onBrightnessChange(brightness);
        }

        isLit = !isLit;
      }, 40);
    };

    const scheduleLightning = () => {
      const delay = 8000 + Math.random() * 12000; // Longer delays: 4-16 seconds
      schedulerTimeout = setTimeout(() => {
        triggerLightning();
        scheduleLightning(); // This creates the loop - but now with longer delays
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

export function PixelRain({ numberOfDrops = 100 }: PixelRainProps) {
  const [skylineBrightness, setSkylineBrightness] = useState(0.5);
  const [moonIntensity, setMoonIntensity] = useState(0);
  const handleBrightnessChange = useCallback((brightness: number) => {
    setSkylineBrightness(brightness);
  }, []);

  const steppedGradient = useMemo(() => {
    const steps = 40;
    const startColor = { r: 85, g: 105, b: 135 };
    const endColor = { r: 0, g: 0, b: 0 };
    let gradientSteps = [];
    const easeOutQuint = (t: number) => Math.pow(t, 8);

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

      const positionStart = i === 0 ? 0 : easeOutQuint(i / steps) * 100;
      const positionEnd =
        i === steps - 1 ? 100 : easeOutQuint((i + 1) / steps) * 100;

      gradientSteps.push(
        `rgb(${r}, ${g}, ${b}) ${positionStart}%`,
        `rgb(${r}, ${g}, ${b}) ${positionEnd}%`
      );
    }
    return `linear-gradient(180deg, ${gradientSteps.join(", ")})`;
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
      <div className="fixed inset-0 z-[-2]">
        <FlyingCars numberOfCars={50} />
      </div>{" "}
      <div className="fixed inset-0 z-[-4]">
        <div
          className="pixel-gradient"
          style={{ background: steppedGradient, imageRendering: "pixelated" }}
        />
      </div>
      <div className="fixed bottom-[10vh] left-[20vh] z-[-1]  h-[500px]">
        <img src="./cyberman.png" alt="Hero background" className="h-[500px]" />
      </div>
      <MoonGlow onMoonIntensityChange={setMoonIntensity} />
      <Lightning onBrightnessChange={handleBrightnessChange} />
      <div
        style={{
          position: "fixed",
          inset: 0,
          height: "37%",
          zIndex: -3,
          pointerEvents: "none",
          background:
            "linear-gradient(to top, rgba(255, 120, 70, 0.3) 15%, transparent 37%)",
        }}
      />{" "}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100vh",
          zIndex: -2,
          pointerEvents: "none",
          filter: `brightness(${skylineBrightness + moonIntensity})`,
          background: steppedGradient,
          backgroundAttachment: "fixed",
          imageRendering: "pixelated",
          maskImage: "url(/skyline.svg)",
          maskSize: "100% 100vh",
          maskRepeat: "no-repeat",
        }}
      />{" "}
      <div aria-hidden="true" className="pixel-rain-container">
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
          </div>
        ))}
      </div>
      {/* Splats outside wind container */}
      <div aria-hidden="true" className="pixel-splat-container">
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
              } as any
            }
          />
        ))}
      </div>
    </>
  );
}
