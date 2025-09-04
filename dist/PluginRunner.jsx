import { jsx as R, Fragment as k } from "react/jsx-runtime";
import { useState as E, useRef as l, useEffect as D } from "react";
import { pluginStore as d } from "./pluginStore.js";
import { getGlobalStore as u } from "./store.js";
import { isDeepEqual as v } from "./utility.js";
function j({ children: b }) {
  const [, p] = E({}), M = l(/* @__PURE__ */ new Map());
  D(() => d.subscribe(() => {
    p({});
  }), []);
  const s = d.getState(), f = /* @__PURE__ */ new Map();
  s.pluginOptions.forEach((i, e) => {
    const r = s.stateHandlers.get(e);
    r && s.registeredPlugins.forEach((t) => {
      const a = i.get(t.name);
      if (a !== void 0 && t.useHook) {
        const n = `${e}:${t.name}`, g = {
          stateKey: e,
          cogsState: r,
          getPluginMetaData: () => u.getState().getPluginMetaDataMap(e, [])?.get(t.name),
          setPluginMetaData: (o) => u.getState().setPluginMetaData(e, t.name, o),
          removePluginMetaData: () => u.getState().removePluginMetaData(e, [], t.name)
        }, c = t.useHook(g, a);
        f.set(n, c);
      }
    });
  });
  const P = l(s);
  P.current = s;
  const S = l(f);
  return S.current = f, D(() => {
    const i = (r) => {
      const t = P.current, a = S.current, { stateKey: n } = r, g = t.stateHandlers.get(n), c = t.pluginOptions.get(n);
      !g || !c || t.registeredPlugins.forEach((o) => {
        if (o.onUpdate && c.has(o.name)) {
          const m = c.get(o.name), h = `${n}:${o.name}`, H = a.get(h);
          o.onUpdate(n, r, m, H);
        }
      });
    };
    return d.getState().subscribeToUpdates(i);
  }, []), s.pluginOptions.forEach((i, e) => {
    const r = s.stateHandlers.get(e);
    r && s.registeredPlugins.forEach((t) => {
      if (t.transformState) {
        const a = i.get(t.name);
        if (a === void 0) return;
        const n = `${e}:${t.name}`, g = M.current.get(n);
        if (!v(a, g)) {
          const c = {
            stateKey: e,
            cogsState: r,
            getPluginMetaData: () => u.getState().getPluginMetaDataMap(e, [])?.get(t.name),
            setPluginMetaData: (m) => u.getState().setPluginMetaData(e, t.name, m),
            removePluginMetaData: () => u.getState().removePluginMetaData(e, [], t.name)
          }, o = f.get(n);
          t.transformState(c, a, o), M.current.set(n, a);
        }
      }
    });
  }), /* @__PURE__ */ R(k, { children: b });
}
export {
  j as PluginRunner
};
//# sourceMappingURL=PluginRunner.jsx.map
