export function PerspectiveGround({ zIndex = -200 }) {
  return (
    <div
      style={{
        position: "fixed",
        left: "-270%",
        bottom: "-5vh",
        width: "300%",
        height: "9000px",
        transformOrigin: "bottom right",
        transform:
          "perspective(1300px) rotateX(59deg) rotateZ(15deg) rotateY(0deg)",
        // Apply the zIndex directly here
        zIndex: zIndex,
        pointerEvents: "none",
      }}
    >
      {/* ... your img and haze div ... */}
      <img
        src="./bigsand.png"
        alt=""
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          imageRendering: "pixelated",
          opacity: 0.8,
          filter:
            "brightness(0.4) contrast(2) saturate(0.6) hue-rotate(-10deg)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: `linear-gradient(to top, rgba(0, 0, 0, 0) 10%, rgba(0, 0, 0, 0.8) 50%, rgba(0, 0, 0, 1) 95%)`,
        }}
      />
    </div>
  );
}
export function PerspectiveGroundRight({ zIndex }: { zIndex: number }) {
  return (
    <div
      style={{
        position: "fixed",
        // MIRRORED: Position from the right side instead of left
        right: "-270%",
        bottom: "-5vh",
        width: "300%",
        height: "9000px",
        // MIRRORED: Transform origin is now bottom left
        transformOrigin: "bottom left",
        // MIRRORED TRANSFORM + Z-FIGHTING FIX
        transform: "perspective(1300px) rotateX(59.01deg) rotateZ(-15deg)",
        zIndex: zIndex,
        pointerEvents: "none",
      }}
    >
      {/* ... your img and haze div ... */}
      <img
        src="./bigsand.png"
        alt=""
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          imageRendering: "pixelated",
          opacity: 0.8,
          filter:
            "brightness(0.4) contrast(2) saturate(0.6) hue-rotate(-10deg)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: `linear-gradient(to top, rgba(0, 0, 0, 0) 10%, rgba(0, 0, 0, 0.8) 50%, rgba(0, 0, 0, 1) 95%)`,
        }}
      />
    </div>
  );
}
