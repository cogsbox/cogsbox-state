import React from "react";
import ReactDOM from "react-dom/client";

import FormsMain from "./form/FormMain";
import Reactivity from "./reactive/Reactivity";
import ArrayReactivity from "./array-reactivity/ArrayReactivity";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <div className="bg-gray-50">
      {/* <ReactiveMain />
      <FormsMain /> */}
      <Reactivity />
      <ArrayReactivity />
    </div>
  </React.StrictMode>
);
