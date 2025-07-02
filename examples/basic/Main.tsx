import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import Reactivity from "./reactive/Reactivity";
import ArrayReactivity from "./array-reactivity/ArrayReactivity";

import { PixelRain } from "./PixelRain";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <div className="relative min-h-screen bg-gradient-to-b from-gray-800 to-gray-900 z-0">
      <div className="pointer-events-none">
        <PixelRain />
      </div>
      <div className="px-12">
        <Reactivity />
        {/* <ArrayReactivity /> */}
      </div>
    </div>
  </React.StrictMode>
);
