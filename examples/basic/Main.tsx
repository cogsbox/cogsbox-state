import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import Reactivity from "./reactive/Reactivity";
import ArrayReactivity from "./array-reactivity/ArrayReactivity";

import { PixelRain } from "./PixelRain";
import VirtualizedChatExample from "./virtualiser/VirtualizedChatExample";
import ArrayMethodsPage from "./object-example/ObjectExmaple";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <div className="relative  z-0">
      {" "}
      <div className="fixed left-0 w-[8vw] h-[100vh] bg-gradient-to-r from-black/50 to-black/00" />
      <div className="fixed right-0 w-[8vw] h-[100vh] bg-gradient-to-l from-black/50 to-black/00" />
      <div className="pointer-events-none ">
        {" "}
        <PixelRain />{" "}
        <div className="fixed h-screen w-full  bg-gradient-to-b from-black via-gray-900 to-gray-900 z-[-999]" />
      </div>
      <div className="px-[10vw] pt-40 flex flex-col gap-4 z-[999]">
        {/* <Reactivity />
        <div className="h-20" />
        <ArrayReactivity />
        <div className="h-20" /> */}
        {/* <VirtualizedChatExample /> <div className="h-40" />  */}
        <ArrayMethodsPage /> <div className="h-40" />
      </div>{" "}
    </div>
  </React.StrictMode>
);
