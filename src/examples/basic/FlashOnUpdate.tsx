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
        <div
            ref={ref}
            className="transition-all duration-500 bg-white rounded "
        >
            <div className="flex items-center gap-2 bg-blue-400">
                <ComponentIdRenderer componentId={componentId} />
                <div className="flex h-6 w-6 rounded  items-center justify-center p-1">
                    <div className="text-white">{renderCountRef.current}</div>
                </div>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
};
