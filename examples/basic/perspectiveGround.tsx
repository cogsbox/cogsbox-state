// Add this to your Z_INDICES object:
// GROUND_PLANE: -35, // Between CYBERMAN (-30) and SPLAT_CONTAINER (-50)

export function PerspectiveGround() {
  return (
    <div
      style={{
        position: "fixed",
        left: "-270%", // Extends off left side
        bottom: "-5vh", // Near bottom of screen
        width: "300%", // Width of the lot
        height: "9000px", // Height of the lot
        transformOrigin: "bottom right",
        transform:
          "perspective(1300px) rotateX(59deg) rotateZ(15deg) rotateY(0deg)", // rotateZ for slope toward center
        zIndex: -35,
        pointerEvents: "none",
      }}
    >
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
    </div>
  );
}
