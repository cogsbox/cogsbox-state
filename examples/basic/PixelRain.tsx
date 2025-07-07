'use client';
import { useMemo, useState, useCallback, useEffect, useRef } from 'react';

// Assuming these are in separate files as in your original code
import FlyingCars from './FlyingCars';
import BlimpWithSpotlights from './Blimp';

import { CloudLayers } from './CloudTiler';
import { ShadowSilhouette } from './ShadowSilhouette';
import { cyberShadow } from './assets/svgs';

// Centralized Z-Index Management System
const Z_INDICES = {
  // Background layers (furthest back)
  BASE_BACKGROUND: -1000,
  GRADIENT_BACKGROUND: -950,

  // Atmospheric effects

  // Cloud layers
  CLOUDS: -900,
  MOON_GLOW: -600,
  ATMOSPHERIC_OVERLAY_1: -550,
  // Sky elements

  LIGHTNING: -525,
  SKYLINE_BACKGROUND: -500,
  FLYING_CARS: -400,
  BLIMP: -350,
  ATMOSPHERIC_OVERLAY_2: -330,
  SKYLINE_SILHOUETTE: -250,
  ATMOSPHERIC_OVERLAY_3: -150,
  GROUND: -200,
  // Foreground elements
  RAIN_CONTAINER: -100,
  SPLAT_CONTAINER: -50,
  CYBERMAN: -30,
  CAT: -20,

  // Main content (positive values)
  SIDE_GRADIENTS: 10,
};

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
      const baseIntensity = 0.7 + Math.random() * 0.02;
      const steps = 16;
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

        gradientSteps.push(
          `rgba(${r}, ${g}, ${b}, ${opacity}) ${radiusStart}vh`
        );
        gradientSteps.push(`rgba(${r}, ${g}, ${b}, ${opacity}) ${radiusEnd}vh`);
      }

      onMoonIntensityChange(baseIntensity * 0.3);

      moonRef.current.style.background = `radial-gradient(circle 180vh at ${subtleX}vw ${subtleY}vh, transparent ${glowStartRadius}vh, ${gradientSteps.join(
        ', '
      )})`;
    };
    glowInterval = setInterval(updateMoonGlow, 400);
    updateMoonGlow();

    return () => {
      clearInterval(glowInterval);
    };
  }, [onMoonIntensityChange]);

  return (
    <>
      <div
        ref={moonRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: Z_INDICES.MOON_GLOW,
          pointerEvents: 'none',
          background: 'transparent',
          mixBlendMode: 'screen',
          imageRendering: 'pixelated',
        }}
      />

      <div
        ref={moonCircleRef}
        style={{
          position: 'fixed',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          backgroundColor: 'rgba(215, 215, 215, 0.9)',
          zIndex: Z_INDICES.MOON_GLOW,
          pointerEvents: 'none',
          filter: 'blur(1px)',
          transform: 'translate(-50%, -50%)',
          imageRendering: 'pixelated',
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
    const BASE_SKYLINE_BRIGHTNESS = 4.0;

    const triggerLightning = () => {
      if (fadeInterval) return;

      let currentIntensity = 0.2 + Math.random() * 0.2;
      let isLit = true;

      fadeInterval = setInterval(() => {
        currentIntensity *= 0.96;

        if (currentIntensity < 0.01) {
          if (lightningRef.current) {
            lightningRef.current.style.background = 'transparent';
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

            const centerColor = `rgba(255, 255, 255, ${intensity})`;
            const edgeColor = `rgba(200, 220, 255, 0)`;

            const gradient = `radial-gradient(ellipse ${randomWidth}vh ${randomHeight}vh at ${randomX}% ${randomY}vh, ${centerColor} 0%, ${edgeColor} 70%)`;

            lightningRef.current.style.background = gradient;
          }

          const brightness = isLit
            ? Math.max(0.3, BASE_SKYLINE_BRIGHTNESS - currentIntensity * 0.7)
            : BASE_SKYLINE_BRIGHTNESS - currentIntensity * 0.3;

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
        position: 'fixed',
        top: '-400px',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: Z_INDICES.LIGHTNING,
        pointerEvents: 'none',
        background: 'transparent',
        mixBlendMode: 'screen',
        imageRendering: 'pixelated',
      }}
    />
  );
}

export function PixelRain({ numberOfDrops = 120 }: PixelRainProps) {
  const [skylineBrightness, setSkylineBrightness] = useState(1.0);
  const [moonIntensity, setMoonIntensity] = useState(0);
  const handleBrightnessChange = useCallback((brightness: number) => {
    setSkylineBrightness(brightness);
  }, []);

  const carsRef = useRef<HTMLDivElement>(null);
  const cybermanRef = useRef<HTMLDivElement>(null);
  const blimpRef = useRef<HTMLDivElement>(null);
  const skylineRef = useRef<HTMLDivElement>(null);
  const rainContainerRef = useRef<HTMLDivElement>(null);
  const splatContainerRef = useRef<HTMLDivElement>(null);

  const steppedGradient = useMemo(() => {
    const steps = 40;
    const startColor = { r: 35, g: 35, b: 85 }; // Deep CRT blue
    const endColor = { r: 10, g: 10, b: 20 };
    const opacity = 0.85;
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
    return `linear-gradient(180deg, ${gradientSteps.join(', ')})`;
  }, []);

  const drops = useMemo(() => {
    let drops = [];
    for (let i = 0; i < numberOfDrops; i++) {
      const rH = Math.floor(Math.random() * 98) + 1;
      const aD = 0.5 + rH / 100;

      const densityWeight = Math.pow(Math.random(), 4);
      const eH = 60 + densityWeight * 100;

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
    <div className="crt">
      {/* Background gradient */}
      <div
        className="fixed inset-0 background-gradient-masked"
        style={{ zIndex: Z_INDICES.GRADIENT_BACKGROUND }}
      >
        <div
          className="pixel-gradient"
          style={{
            background: steppedGradient,
            imageRendering: 'pixelated',
            position: 'absolute',
            inset: -10,
            opacity: 0.6,
          }}
        />
      </div>

      <MoonGlow onMoonIntensityChange={setMoonIntensity} />
      <Lightning onBrightnessChange={handleBrightnessChange} />

      <div
        ref={carsRef}
        className="fixed inset-0"
        style={{ zIndex: Z_INDICES.FLYING_CARS }}
      >
        <FlyingCars numberOfCars={50} />
      </div>

      <div
        ref={cybermanRef}
        className="fixed bottom-[5vh] left-[5vh] h-[500px]"
        style={{ zIndex: Z_INDICES.CYBERMAN }}
      >
        <img src="./cyberman.png" alt="Hero background" className="h-[500px]" />
        <div
          style={{ zIndex: Z_INDICES.CYBERMAN - 1 }}
          className="h-[500px] w-auto absolute top-[0px] left-[5px] text-sky-400/50 shadow-lg "
        >
          {cyberShadow}
        </div>
        <div className="mt-[-70px] relative">
          <ShadowSilhouette
            src="./cybermanSilh.svg"
            skewX={0}
            skewY={0}
            intensity={200}
          />
        </div>
      </div>

      {/* Cat */}
      {/* <div
        className="fixed bottom-[2vh] left-[50vw] h-[25vh]"
        style={{ zIndex: Z_INDICES.CAT }}
      >
        <div
          className="absolute bottom-[-100px] left-[-50px] w-[200px] h-[200px]"
          style={{
            background:
              'radial-gradient(circle at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0.01) 80%,  rgba(0,0,0,0.0) 100%)',
          }}
        />
        <img src="./cat.png" alt="Hero background" className="h-[400px]" />
      </div> */}
      {/* 
      <div
        className="fixed w-[50vw] left-0 h-[50%] bottom-0 saturate-50 contrast-150"
        style={{ zIndex: Z_INDICES.GROUND }}
      >
        <img src="./backgroundSand.png" alt="" className="h-[100%]" />
      </div>
      <div
        className="fixed w-[50vw] right-0 h-[50%] bottom-0 saturate-50  scale-x-[-1] contrast-150"
        style={{ zIndex: Z_INDICES.GROUND }}
      >
        <img src="./backgroundSand.png" alt="" className="h-[100%]" />
      </div> */}
      <div
        className="fixed w-[100%] left-0 h-[50%] bottom-0 saturate-50  contrast-150"
        style={{ zIndex: Z_INDICES.GROUND }}
      >
        <div className="absolute w-full h-[50%]  top-0 bg-gradient-to-b from-black to-black-0 "></div>
        <img src="./groundTexture.png" alt="" className="h-[100%] w-full" />
      </div>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          height: '42%',
          zIndex: Z_INDICES.ATMOSPHERIC_OVERLAY_1,
          pointerEvents: 'none',
          background:
            'linear-gradient(to top, rgba(255, 120, 70, 0.3) 25%, transparent 67%)',
        }}
      />
      <div
        style={{
          position: 'fixed',
          inset: 0,
          top: '9vh',
          height: '32%',
          zIndex: Z_INDICES.ATMOSPHERIC_OVERLAY_2,
          pointerEvents: 'none',
          background:
            'linear-gradient(to top, rgba(255, 120, 70, 0.25) 10%, transparent 67%)',
        }}
      />
      <div
        style={{
          position: 'fixed',
          inset: 0,
          top: '22%',
          height: '60%',
          filter: 'blur(20px)',
          zIndex: Z_INDICES.ATMOSPHERIC_OVERLAY_3,
          pointerEvents: 'none',
          background:
            'linear-gradient(to top, rgba(255, 120, 70, 0.0) 0%,rgba(255, 120, 30, 0.2) 45%,rgba(255, 120, 70, 0.005) 80%, rgba(255, 120, 70, 0.0) 100%,transparent 37%)',
        }}
      />

      <CloudLayers
        lightningBrightness={skylineBrightness}
        style={{ zIndex: Z_INDICES.CLOUDS, filter: 'blur(5px)' }}
      />

      {/* Blimp Layer */}
      <div
        ref={blimpRef}
        className="fixed top-[23vh]"
        style={{
          zIndex: Z_INDICES.BLIMP,
          animation: 'moveAcross 240s linear infinite',
          transform: 'translateX(-100%)',
          filter: 'contrast(1.1)',
        }}
      >
        <BlimpWithSpotlights />
      </div>
      <style>{`@keyframes moveAcross { from { transform: translateX(-100%); } to { transform: translateX(100vw); }}`}</style>

      <div
        ref={skylineRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          zIndex: Z_INDICES.SKYLINE_BACKGROUND,
          pointerEvents: 'none',
          imageRendering: 'pixelated',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: Z_INDICES.SKYLINE_BACKGROUND,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            filter: `brightness(${
              0.5 * skylineBrightness + moonIntensity * 0.02
            }) contrast(0.97) saturate(0.8)`,
            maskImage: 'url(/skyline.svg)',
            maskSize: '100% 100vh',
            maskPosition: '0 -2vh',
            maskRepeat: 'no-repeat',
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: Z_INDICES.SKYLINE_BACKGROUND,
            background: 'rgba(0, 0, 0, 0.85)',
            maskImage: 'url(/skyline.svg)',
            maskSize: '100% 100vh',
            maskPosition: '0 -2vh',
            maskRepeat: 'no-repeat',
          }}
        />
      </div>

      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          zIndex: Z_INDICES.SKYLINE_SILHOUETTE,
          pointerEvents: 'none',
          filter: `brightness(${
            1 + (1 - skylineBrightness + moonIntensity * 0.02)
          }) contrast(0.93) saturate(0.88)`,
          background: 'black',
          backgroundAttachment: 'fixed',
          imageRendering: 'pixelated',
          transform: 'scaleX(-1)',
          maskImage: 'url(/skyline.svg)',
          maskSize: '100% 60vh',
          maskPosition: '0 20vh',
          maskRepeat: 'no-repeat',
        }}
      />

      <div
        className="fixed top-[26vh] inset-0 bg-gradient-to-b from-black/05 via-black to-black/05 w-full h-[50vh]"
        style={{ zIndex: Z_INDICES.SKYLINE_SILHOUETTE + 10 }}
      />

      <div
        ref={rainContainerRef}
        aria-hidden="true"
        className="pixel-rain-container"
        style={{ zIndex: Z_INDICES.RAIN_CONTAINER }}
      >
        {drops.map((drop) => (
          <div
            key={drop.id}
            className="pixel-raindrop"
            style={
              {
                left: drop.left,
                '--delay': drop.animationDelay,
                '--drop-opacity': drop.opacity,
                '--duration': drop.animationDuration,
                '--end-height': drop.endHeight,
              } as any
            }
          />
        ))}
      </div>

      <div
        ref={splatContainerRef}
        aria-hidden="true"
        className="pixel-splat-container"
        style={{ zIndex: Z_INDICES.SPLAT_CONTAINER }}
      >
        {drops.map((drop) => (
          <div
            key={`splat-${drop.id}`}
            className="pixel-splat"
            style={
              {
                left: drop.left,
                '--delay': drop.animationDelay,
                '--drop-opacity': drop.opacity,
                '--duration': drop.animationDuration,
                '--end-height': drop.endHeight,
                '--splat-duration': `${
                  parseFloat(drop.animationDuration) * 2
                }s`,
                '--size-modifier': drop.sizeModifier,
              } as any
            }
          />
        ))}
      </div>
    </div>
  );
}
