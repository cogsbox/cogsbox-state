"use client";
import { useMemo, useEffect, useState } from "react";

interface PixelRainProps {
  numberOfDrops?: number;
}

export function PixelRain({ numberOfDrops = 200 }: PixelRainProps) {
  const [windStrength, setWindStrength] = useState(0);
  const [lightningFlash, setLightningFlash] = useState(false);
  const [lightningIntensity, setLightningIntensity] = useState(0);
  const [lightningSteps, setLightningSteps] = useState(8);

  // YOUR ORIGINAL CODE, UNTOUCHED
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

  // --- START OF MODIFIED CODE ---
  // Lightning effect - FIXED
  useEffect(() => {
    let fadeInterval: NodeJS.Timeout | undefined;
    let schedulerFrame: number;

    // This function creates the visual flash/flicker effect.
    // It's unchanged, but we added a check to prevent multiple flashes at once.
    const triggerLightning = () => {
      if (fadeInterval) return; // Don't trigger a new flash if one is already active

      let currentIntensity = 0.7 + Math.random() * 0.3;
      let isLit = true;

      fadeInterval = setInterval(() => {
        currentIntensity *= 0.96;

        if (currentIntensity < 0.01) {
          setLightningFlash(false);
          setLightningIntensity(0);
          clearInterval(fadeInterval);
          fadeInterval = undefined; // Reset the flag so a new flash can be triggered
        } else {
          const frameIntensity = isLit ? currentIntensity : 0;
          setLightningFlash(isLit);
          setLightningIntensity(frameIntensity);

          if (isLit) {
            const steps = Math.max(2, Math.floor(currentIntensity * 50));
            setLightningSteps(steps);
          }
        }
        isLit = !isLit;
      }, 40);
    };

    // NEW: A robust scheduler using requestAnimationFrame
    // This avoids being paused indefinitely by browser tab throttling.
    let lastTime = performance.now();
    let timeUntilNextStrike = 10000 + Math.random() * 1000; // Initial delay

    const lightningScheduler = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      timeUntilNextStrike -= deltaTime;

      if (timeUntilNextStrike <= 0) {
        triggerLightning();
        // Reset the timer for the next strike
        timeUntilNextStrike = 2000 + Math.random() * 10000;
      }

      schedulerFrame = requestAnimationFrame(lightningScheduler);
    };

    // Start the scheduler loop
    schedulerFrame = requestAnimationFrame(lightningScheduler);

    // The new, unified cleanup function. This now correctly stops
    // all activity (both the scheduler and any active flash) when the component unmounts.
    return () => {
      cancelAnimationFrame(schedulerFrame);
      if (fadeInterval) {
        clearInterval(fadeInterval);
      }
    };
  }, []);
  // --- END OF MODIFIED CODE ---

  // ALL CODE BELOW THIS POINT IS YOUR ORIGINAL CODE, UNTOUCHED.

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
        <div
          className="pixel-gradient"
          style={{ background: steppedGradient, imageRendering: "pixelated" }}
        />
      </div>
      <div
        className="lightning-flash"
        style={{
          position: "fixed",
          top: "-400px",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          pointerEvents: "none",
          background: lightningGradient,
          mixBlendMode: "screen",
          imageRendering: "pixelated",
        }}
      />
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
              style={{
                left: drop.left,
                "--delay": drop.animationDelay,
                "--drop-opacity": drop.opacity,
                "--duration": drop.animationDuration,
                "--end-height": drop.endHeight,
                "--wind-sensitivity": drop.windSensitivity,
              }}
            >
              <div className="pixel-stem" />
            </div>
            <div
              className="pixel-splat"
              style={{
                left: drop.left,
                "--delay": drop.animationDelay,
                "--drop-opacity": drop.opacity,
                "--duration": drop.animationDuration,
                "--end-height": drop.endHeight,
                "--splat-duration": `${
                  parseFloat(drop.animationDuration) * 2
                }s`,
              }}
            />
          </div>
        ))}
      </div>
    </>
  );
}
