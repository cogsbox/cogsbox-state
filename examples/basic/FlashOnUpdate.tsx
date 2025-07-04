import React, { useEffect, useRef, useState } from "react";

export const FlashWrapper = ({
  children,
  color = "red",
}: {
  children: React.ReactNode;
  color?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const renderCountRef = useRef(0);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.outline = `2px solid ${color}`;
    ref.current.style.backgroundColor = `rgba(255, 0, 0, 0.05)`;
    ref.current.style.backgroundImage = `radial-gradient(rgba(255, 255, 255, 0.3) 2px, transparent 2px)`;
    ref.current.style.backgroundSize = "4px 4px";
    renderCountRef.current++;
    const timer = setTimeout(() => {
      if (ref.current) {
        ref.current.style.outline = "none";

        ref.current.style.backgroundColor = "transparent";
      }
    }, 200);
    return () => clearTimeout(timer);
  });

  return (
    <div ref={ref} className="p-2">
      {children}
    </div>
  );
};
