"use client";
import { jsx as n } from "react/jsx-runtime";
import { createContext as s, useContext as i } from "react";
const r = {
  sessionId: void 0
}, o = s(r), u = () => i(o);
function f({
  children: t,
  sessionId: e
}) {
  return /* @__PURE__ */ n(o.Provider, { value: { sessionId: e }, children: t });
}
export {
  f as CogsStateClient,
  r as config,
  u as useCogsConfig
};
//# sourceMappingURL=CogsStateClient.jsx.map
