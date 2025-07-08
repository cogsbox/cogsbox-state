import { useMemo } from "react";

type ShadowSilhouetteProps = {
  src: string;
  skewX: number;
  skewY: number;
  intensity: number; // 0–1
  duplicate?: boolean;
};

export const ShadowSilhouette = ({
  src,
  skewX,
  skewY,
  intensity,
  duplicate = false,
}: ShadowSilhouetteProps) => {
  const opacity = Math.min(1, Math.max(0, intensity)) * 0.6 + 0.2;

  const flickerDuration = useMemo(
    () => `${0.2 + (1 - intensity) * 0.8}s`,
    [intensity]
  );

  const commonStyle: React.CSSProperties = {
    transform: `scaleY(-1.5) skew(${skewX}deg, ${skewY}deg) translateY(-100%)`,
    transformOrigin: "center top",

    pointerEvents: "none",
    animation: `flicker ${flickerDuration} infinite ease-in-out alternate`,
    position: "absolute",
  };

  return (
    <>
      <img src={src} alt="Shadow silhouette" style={commonStyle} />
      {duplicate && (
        <img
          src={src}
          alt="Shadow silhouette duplicate"
          style={{
            ...commonStyle,
            transform: `scaleY(-1) skew(${skewX + Math.random() * 4 - 2}deg, ${
              skewY + Math.random() * 2 - 1
            }deg) translateX(${Math.random() * 10 - 5}px)`,
          }}
        />
      )}
    </>
  );
};
