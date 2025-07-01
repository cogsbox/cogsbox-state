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
    ref.current.style.outline = "2px solid red";

    renderCountRef.current++;
    const timer = setTimeout(() => {
      if (ref.current) {
        ref.current.style.outline = "none";
        ref.current.style.backgroundColor = "white";
      }
    }, 200);
    return () => clearTimeout(timer);
  });

  return <div ref={ref}>{children}</div>;
};
