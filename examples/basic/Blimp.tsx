import React from "react";

const BlimpWithSpotlights = () => {
  return (
    <div className="relative ">
      {/* Inline keyframe animations */}
      <style>
        {`
          @keyframes swayLeft {
            0%, 100% { transform: rotate(15deg); }
            25% { transform: rotate(10deg); }
            50% { transform: rotate(25deg); }
            75% { transform: rotate(5deg); }
          }

          @keyframes swayRight {
            0%, 100% { transform: rotate(-20deg); }
            20% { transform: rotate(-10deg); }
            40% { transform: rotate(-30deg); }
            60% { transform: rotate(-5deg); }
            80% { transform: rotate(-15deg); }
          }
        `}
      </style>

      {/* Blimp */}
      <div
        style={{
          position: "relative",
          top: "0",
          left: "0",
          zIndex: -1,
          pointerEvents: "none",
          backgroundAttachment: "fixed",
          imageRendering: "pixelated",
        }}
      >
        <img src="./blimp.svg" alt="blimp" className="h-[88px] text-gray-200" />

        {/* Blimp illumination overlay */}
        <div
          className="absolute inset-0"
          style={{
            maskImage: "url('./blimp.svg')",
            maskSize: "contain",
            maskRepeat: "no-repeat",
            maskPosition: "center",
            WebkitMaskImage: "url('./blimp.svg')",
            WebkitMaskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            background: `
              linear-gradient(to top, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.06) 40%, transparent 70%),
              radial-gradient(circle at 35% 82%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.2) 5%, transparent 20%),
              radial-gradient(circle at 65% 82%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.2) 5%, transparent 20%)
            `,
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Spotlight Container */}
      <div
        className="absolute  pointer-events-none"
        style={{
          top: "64px",
          left: "19px", // Adjust based on blimp positioning
          zIndex: -2,
        }}
      >
        {/* Left Spotlight */}
        <div
          className="absolute"
          style={{
            transformOrigin: "top center",
            // Adjust based on blimp positioning
            animation: "swayLeft 20s ease-in-out infinite",
          }}
        >
          <div
            className="w-22 h-60"
            style={{
              marginTop: "-7px",
              clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
              background:
                "linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.3) 5%,rgba(255,255,255,0.05)  25%, rgba(255,255,255,0) 100%)",
              filter: "blur(2px)",
            }}
          />
        </div>

        {/* Right Spotlight */}
        <div
          className="absolute"
          style={{
            left: "50px", // Offset from left spotlight
            transformOrigin: "top center",
            animation: "swayRight 30s ease-in-out infinite 1s", // Different timing and delay
          }}
        >
          <div
            className="w-22 h-60"
            style={{
              marginTop: "-7px",
              clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
              background:
                "linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.3) 5%,rgba(255,255,255,0.05)  25%, rgba(255,255,255,0) 100%)",
              filter: "blur(2px)",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default BlimpWithSpotlights;
