import React from "react";
import ReactDOM from "react-dom/client";

import FormsMain from "./form/FormMain";
import Reactivity from "./Reactivity";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <div className="bg-gray-50">
      {/* <ReactiveMain />
      <FormsMain /> */}
      <Reactivity />
    </div>
  </React.StrictMode>
);
