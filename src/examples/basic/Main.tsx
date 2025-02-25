import React from "react";
import ReactDOM from "react-dom/client";
import ReactiveMain from "./reactive/ReactiveMain";
import FormsMain from "./form/FormMain";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <ReactiveMain />
        <FormsMain />
    </React.StrictMode>
);
