import React from "react";
import ReactDOM from "react-dom/client";
import ReactiveMain from "./reactive/ReactiveMain";
import FormsMain from "./form/FormMain";
import SyncTest from "../sync/SyncTest";
import SyncPage from "../sync/vite/CogsSync";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <div className="bg-gray-50">
      <SyncPage sessionId={"testSession"}>
        <SyncTest />
      </SyncPage>
      <ReactiveMain />
      <FormsMain />
    </div>
  </React.StrictMode>
);
