import { jsxs as S, Fragment as P, jsx as D } from "react/jsx-runtime";
import M, { useMemo as R, useRef as l, useEffect as i, useReducer as U } from "react";
import { pluginStore as g } from "./pluginStore.js";
import { getGlobalStore as f } from "./store.js";
import { isDeepEqual as h } from "./utility.js";
const k = M.memo(
  ({
    stateKey: r,
    plugin: e,
    options: n,
    stateHandler: c
  }) => {
    const s = R(
      () => ({
        stateKey: r,
        cogsState: c,
        getPluginMetaData: () => f.getState().getPluginMetaDataMap(r, [])?.get(e.name),
        setPluginMetaData: (a) => f.getState().setPluginMetaData(r, e.name, a),
        removePluginMetaData: () => f.getState().removePluginMetaData(r, [], e.name)
      }),
      [r, c, e.name]
    ), t = e.useHook ? e.useHook(s, n) : void 0, m = l();
    i(() => {
      e.transformState && (h(n, m.current) || (e.transformState(s, n, t), m.current = n));
    }, [s, e, n, t]);
    const o = l(t);
    return o.current = t, i(() => {
      if (!e.onUpdate)
        return;
      const a = (u) => {
        u.stateKey === r && e.onUpdate(r, u, n, o.current);
      };
      return g.getState().subscribeToUpdates(a);
    }, [r, e, n, s]), null;
  }
);
function A({ children: r }) {
  const [, e] = U((t) => t + 1, 0);
  i(() => g.subscribe(e), []);
  const { pluginOptions: n, stateHandlers: c, registeredPlugins: s } = g.getState();
  return /* @__PURE__ */ S(P, { children: [
    Array.from(n.entries()).map(([t, m]) => {
      const o = c.get(t);
      return o ? Array.from(m.entries()).map(([a, b]) => {
        const u = s.find((d) => d.name === a);
        return u ? /* @__PURE__ */ D(
          k,
          {
            stateKey: t,
            plugin: u,
            options: b,
            stateHandler: o
          },
          `${t}:${a}`
        ) : null;
      }) : null;
    }),
    "testsetsetsetsetsetsetsetse123123213",
    JSON.stringify(n),
    r
  ] });
}
export {
  A as PluginRunner
};
//# sourceMappingURL=PluginRunner.jsx.map
