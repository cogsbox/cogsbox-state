import React, { useEffect, useRef, useState } from "react";
import ComponentIdRenderer from "./ComponentIdRenderer";

export const FlashWrapper = ({
    children,
    componentId,
}: {
    children: React.ReactNode;
    componentId: string;
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const renderCountRef = useRef(0);

    useEffect(() => {
        if (!ref.current) return;
        ref.current.style.outline = "8px solid #48f3";
        renderCountRef.current++;
        const timer = setTimeout(() => {
            if (ref.current) ref.current.style.outline = "none";
        }, 300);
        return () => clearTimeout(timer);
    });

    return (
        <div ref={ref} className="transition-all duration-500">
            <ComponentIdRenderer componentId={componentId} />
            <div className="flex h-5 w-5 rounded-lg bg-blue-400 items-center justify-center">
                <div className="text-white">{renderCountRef.current}</div>
            </div>
            {children}
        </div>
    );
};
