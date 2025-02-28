import React from "react";
import ReactDOM from "react-dom/client";
import ReactiveMain from "./reactive/ReactiveMain";
import FormsMain from "./form/FormMain";
import SyncTest from "../sync/SyncTest";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <div className="bg-gray-50">
      <SyncTest />
      <ReactiveMain />
      <FormsMain />
    </div>
  </React.StrictMode>
);
