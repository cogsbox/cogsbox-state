import { useMemo, useEffect, useRef } from 'react';

// The time in milliseconds of inactivity before the storm's energy recharges.
const STORM_RECHARGE_TIME = 3000;
// How much energy is depleted with each flash (e.g., 0.7 means it retains 70% of its energy).
const ENERGY_DECAY_FACTOR = 0.75;

interface CloudLayersProps {
  style: React.CSSProperties;
  layers?: number;
  startOffset?: number;
  layerSpacing?: number;
  className?: string;
  lightningBrightness?: number;
}

export function CloudLayers({
  style,
  layers = 4,
  startOffset = 0,
  layerSpacing = 2,
  className = '',
  lightningBrightness = 0.1,
}: CloudLayersProps) {
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const previousBrightness = useRef(0.1);

  // --- NEW: Refs to manage the storm's state over time ---
  const stormEnergyRef = useRef(1.0); // 1.0 = full power
  const lastStrikeTimeRef = useRef(0);

  const layerData = useMemo(
    () =>
      Array.from({ length: layers }, (_, i) => ({
        id: i,
        horizontal: -(Math.random() * 20 - 10),
        opacity: 0.5 + Math.random() * 0.1,
        tilt: Math.random() * 0.5 - 0.25,
      })),
    [layers]
  );

  useEffect(() => {
    const isStrike =
      lightningBrightness < previousBrightness.current &&
      previousBrightness.current > 0.15;

    if (isStrike) {
      const now = Date.now();
      const timeSinceLastStrike = now - lastStrikeTimeRef.current;

      // --- NEW: Recharge storm energy if there's been a long pause ---
      if (timeSinceLastStrike > STORM_RECHARGE_TIME) {
        // It's a new storm, reset to full power.
        stormEnergyRef.current = 1.0;
      }

      // Calculate the potential intensity from the prop value.
      const baseIntensity = (previousBrightness.current - 0.1) * 0.5;

      // --- NEW: Scale the intensity by the current storm energy ---
      const finalIntensity = baseIntensity * stormEnergyRef.current;

      // Select layers to light up
      const layersToLight = Math.floor(Math.random() * 3) + 2;
      const selectedLayers = new Set<number>();
      while (selectedLayers.size < layersToLight) {
        selectedLayers.add(Math.floor(Math.random() * layers));
      }

      selectedLayers.forEach((layerIndex) => {
        const layer = layerRefs.current[layerIndex];
        if (!layer) return;

        const x = 66 + Math.random() * 34;
        const y = 50 + (Math.random() - 0.5) * 40;
        const size = 20 + Math.random() * 40;

        // Use the new `finalIntensity` which decays over time
        layer.style.background = `radial-gradient(circle ${size}vh at ${x}% ${y}%, rgba(255, 255, 255, ${finalIntensity}) 0%, transparent 50%)`;
        layer.style.transition = 'none';

        setTimeout(() => {
          if (!layer) return;
          layer.style.transition = 'background 0.5s ease-out';
          layer.style.background = 'transparent';
        }, 300);
      });

      // --- NEW: Deplete the storm's energy for the next strike ---
      stormEnergyRef.current *= ENERGY_DECAY_FACTOR;
      // Prevent energy from becoming effectively zero
      if (stormEnergyRef.current < 0.1) {
        stormEnergyRef.current = 0.1;
      }

      // Record the time of this strike.
      lastStrikeTimeRef.current = now;
    }

    previousBrightness.current = lightningBrightness;
  }, [lightningBrightness, layers]);

  return (
    <div
      className={`fixed inset-0 z-[-6] h-full w-[140vw] left-[-20vh] top-0 ${className}`}
      style={style}
    >
      <div className="relative w-full h-full overflow-hidden">
        {layerData.map((layer, index) => {
          return (
            <div
              key={layer.id}
              className="absolute w-full"
              style={{
                top: `${startOffset + layer.id * layerSpacing + index / 2}vh`,
                left: `${layer.horizontal}%`,
                zIndex: layers - layer.id,
              }}
            >
              {/* Base cloud layer */}
              <CloudTiles tilt={layer.tilt} />

              {/* Lightning mask overlay */}
              <div
                ref={(el) => (layerRefs.current[index] = el)}
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'transparent',
                  mixBlendMode: 'screen',
                  maskImage: `url("data:image/svg+xml,${encodeURIComponent(
                    `<svg width="3200" height="120" viewBox="0 0 3200 120" xmlns="http://www.w3.org/2000/svg">${[
                      ...Array(8),
                    ]
                      .map(
                        (_, i) =>
                          `<path d="M${i * 400},0 H${(i + 1) * 400} V60 C${
                            375 + i * 400
                          },62.5 ${365 + i * 400},70 ${340 + i * 400},70 C${
                            315 + i * 400
                          },70 ${305 + i * 400},62.5 ${280 + i * 400},65 C${
                            255 + i * 400
                          },67.5 ${245 + i * 400},77.5 ${220 + i * 400},75 C${
                            195 + i * 400
                          },72.5 ${185 + i * 400},65 ${160 + i * 400},67.5 C${
                            135 + i * 400
                          },70 ${125 + i * 400},77.5 ${100 + i * 400},75 C${
                            75 + i * 400
                          },72.5 ${65 + i * 400},62.5 ${40 + i * 400},65 C${
                            20 + i * 400
                          },67.5 ${15 + i * 400},60 ${
                            i * 400
                          },60 Z" fill="white"/>`
                      )
                      .join('')}</svg>`
                  )}`,
                  WebkitMaskImage: `url("data:image/svg+xml,${encodeURIComponent(
                    `<svg width="3200" height="120" viewBox="0 0 3200 120" xmlns="http://www.w3.org/2000/svg">${[
                      ...Array(8),
                    ]
                      .map(
                        (_, i) =>
                          `<path d="M${i * 400},0 H${(i + 1) * 400} V60 C${
                            375 + i * 400
                          },62.5 ${365 + i * 400},70 ${340 + i * 400},70 C${
                            315 + i * 400
                          },70 ${305 + i * 400},62.5 ${280 + i * 400},65 C${
                            255 + i * 400
                          },67.5 ${245 + i * 400},77.5 ${220 + i * 400},75 C${
                            195 + i * 400
                          },72.5 ${185 + i * 400},65 ${160 + i * 400},67.5 C${
                            135 + i * 400
                          },70 ${125 + i * 400},77.5 ${100 + i * 400},75 C${
                            75 + i * 400
                          },72.5 ${65 + i * 400},62.5 ${40 + i * 400},65 C${
                            20 + i * 400
                          },67.5 ${15 + i * 400},60 ${
                            i * 400
                          },60 Z" fill="white"/>`
                      )
                      .join('')}</svg>`
                  )}`,
                  maskSize: '100% 100%',
                  WebkitMaskSize: '100% 100%',
                  maskRepeat: 'no-repeat',
                  WebkitMaskRepeat: 'no-repeat',
                  transform: `rotate(${layer.tilt}deg)`,
                  transformOrigin: 'center',
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface CloudTilesProps {
  tilt?: number;
  className?: string;
}

export function CloudTiles({
  tilt = 0,
  className = '',
  lightColor,
}: CloudTilesProps & { lightColor?: string }) {
  return (
    <div
      className={`flex overflow-hidden ${className}`}
      style={{
        transform: `rotate(${tilt}deg)`,
        transformOrigin: 'center',
      }}
    >
      {[...Array(8)].map((_, i) => (
        <svg
          key={i}
          width="400"
          height="120"
          viewBox="0 0 400 120"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="flex-1"
        >
          <defs>
            <linearGradient
              id={`grad${i}${lightColor || ''}`}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="50%"
            >
              <stop
                offset="0%"
                stopColor={lightColor || '#0f0f0f'}
                stopOpacity="1"
              />
              <stop
                offset="100%"
                stopColor={lightColor || '#0f0f0f'}
                stopOpacity="0.5"
              />
            </linearGradient>
          </defs>
          <path
            d="M0,0
              H400
              V60
              C375,62.5 365,70 340,70
             C315,70 305,62.5 280,65
             C255,67.5 245,77.5 220,75
             C195,72.5 185,65 160,67.5
             C135,70 125,77.5 100,75
             C75,72.5 65,62.5 40,65
             C20,67.5 15,60 0,60
              Z"
            fill={`url(#grad${i}${lightColor || ''})`}
          />
        </svg>
      ))}
    </div>
  );
}
