import React, { useEffect, useRef, useState } from 'react';

export const FlashWrapper = ({
  children,
  color = 'red',
}: {
  children: React.ReactNode;
  color?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const renderCountRef = useRef(0);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.outline = `2px solid ${color}`;
    ref.current.style.backgroundColor = `rgba(255, 0, 0, 0.1)`;
    ref.current.style.position = 'relative';

    // Add overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
    overlay.style.pointerEvents = 'none';
    ref.current.appendChild(overlay);

    renderCountRef.current++;
    const timer = setTimeout(() => {
      if (ref.current) {
        ref.current.style.outline = 'none';
        ref.current.style.backgroundColor = 'transparent';
        overlay.remove();
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      if (ref.current) {
        overlay.remove();
      }
    };
  });

  return (
    <div ref={ref} className="p-1">
      {children}
    </div>
  );
};
