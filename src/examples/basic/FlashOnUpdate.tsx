import React, { useEffect, useRef, useState } from "react";

export const FlashWrapper = ({
    children,
    title,
    componentId,
}: {
    children: React.ReactNode;
    title: string;
    componentId: string;
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const renderCountRef = useRef(0);

    useEffect(() => {
        if (!ref.current) return;
        ref.current.style.outline = "8px solid red";
        ref.current.style.backgroundColor = "red";
        renderCountRef.current++;
        const timer = setTimeout(() => {
            if (ref.current) {
                ref.current.style.outline = "none";
                ref.current.style.backgroundColor = "white";
            }
        }, 200);
        return () => clearTimeout(timer);
    });

    return (
        <div
            ref={ref}
            className="transition-all duration-500 bg-white rounded-lg font-bold shadow"
        >
            <div className="flex items-center  bg-sky-500 text-white rounded-t-lg  px-4 w-full  p-2">
                <div className="text-2xl flex-1"> {title} </div>

                <div className="flex h-full w-[150px]  items-center  justify-center px-2">
                    Render: <div className="w-2" />
                    <span className="text-2xl ">{renderCountRef.current}</span>
                </div>
            </div>
            <div className="px-6 py-2 font-normal">
                {children}{" "}
                <div className="text-xs text-gray-300 ">{componentId}</div>
            </div>
        </div>
    );
};
