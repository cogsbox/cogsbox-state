import React, { useEffect, useRef, useState } from 'react';

export const FlashWrapper = ({
  children,
  color = 'red',
  showCounter = false,
}: {
  children: React.ReactNode;
  color?: string;
  showCounter?: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const renderCountRef = useRef(0);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.boxShadow = `0 0 0 2px ${color}`;
    ref.current.style.backgroundColor = `rgba(255, 0, 0, 0.1)`;
    ref.current.style.position = 'relative';
    ref.current.style.padding = '0';
    // Add overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';

    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.backgroundColor = 'rgba(255, 0, 0, 0.04)';
    overlay.style.pointerEvents = 'none';
    if (showCounter) {
      overlay.textContent = (++renderCountRef.current).toString();
      overlay.style.color = 'red';
      overlay.style.fontSize = '24px';
      overlay.style.fontWeight = 'bold';
      overlay.style.textAlign = 'right';
      overlay.style.padding = '4px';
    }
    ref.current.appendChild(overlay);

    const timer = setTimeout(() => {
      if (ref.current) {
        ref.current.style.boxShadow = 'none';

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
