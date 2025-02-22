import React, { useEffect, useRef } from "react";

export const FlashWrapper = ({ children }: { children: React.ReactNode }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current) return;
        ref.current.style.outline = "2px solid #48f3";
        const timer = setTimeout(() => {
            if (ref.current) ref.current.style.outline = "none";
        }, 300);
        return () => clearTimeout(timer);
    });

    return (
        <div ref={ref} className="transition-all duration-300">
            {children}
        </div>
    );
};
