import { jsxs as S, Fragment as P, jsx as D } from "react/jsx-runtime";
import U, { useMemo as M, useRef as l, useEffect as f, useReducer as h } from "react";
import { pluginStore as i } from "./pluginStore.js";
import { getGlobalStore as d } from "./store.js";
import { isDeepEqual as R } from "./utility.js";
const F = U.memo(
  ({
    stateKey: r,
    plugin: e,
    options: t,
    stateHandler: c
  }) => {
    const s = M(
      () => ({
        stateKey: r,
        cogsState: c,
        getPluginMetaData: () => d.getState().getPluginMetaDataMap(r, [])?.get(e.name),
        setPluginMetaData: (o) => d.getState().setPluginMetaData(r, e.name, o),
        removePluginMetaData: () => d.getState().removePluginMetaData(r, [], e.name)
      }),
      [r, c, e.name]
    ), a = e.useHook ? e.useHook(s, t) : void 0, m = l();
    f(() => {
      e.transformState && (R(t, m.current) || (e.transformState(s, t, a), m.current = t));
    }, [s, e, t, a]);
    const u = l(a);
    return u.current = a, f(() => {
      if (!e.onUpdate)
        return;
      const o = (n) => {
        n.stateKey === r && e.onUpdate(r, n, t, u.current);
      };
      return i.getState().subscribeToUpdates(o);
    }, [r, e, t, s]), f(() => {
      if (!e.onFormUpdate)
        return;
      const o = (n) => {
        n.stateKey === r && e.onFormUpdate(
          r,
          {
            type: n.type,
            path: n.path,
            value: n.value
          },
          t,
          u.current
        );
      };
      return i.getState().subscribeToFormUpdates(o);
    }, [r, e, t]), null;
  }
);
function v({ children: r }) {
  const [, e] = h((a) => a + 1, 0);
  f(() => i.subscribe(e), []);
  const { pluginOptions: t, stateHandlers: c, registeredPlugins: s } = i.getState();
  return /* @__PURE__ */ S(P, { children: [
    Array.from(t.entries()).map(([a, m]) => {
      const u = c.get(a);
      return u ? Array.from(m.entries()).map(([o, b]) => {
        const n = s.find((g) => g.name === o);
        return n ? /* @__PURE__ */ D(
          F,
          {
            stateKey: a,
            plugin: n,
            options: b,
            stateHandler: u
          },
          `${a}:${o}`
        ) : null;
      }) : null;
    }),
    r
  ] });
}
export {
  v as PluginRunner
};
//# sourceMappingURL=PluginRunner.jsx.map
