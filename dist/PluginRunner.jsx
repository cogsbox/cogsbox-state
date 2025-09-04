import { jsxs as P, Fragment as S, jsx as D } from "react/jsx-runtime";
import M, { useMemo as R, useRef as l, useEffect as i, useReducer as U } from "react";
import { pluginStore as b } from "./pluginStore.js";
import { getGlobalStore as f } from "./store.js";
import { isDeepEqual as h } from "./utility.js";
const k = M.memo(
  ({
    stateKey: r,
    plugin: e,
    options: n,
    stateHandler: c
  }) => {
    const a = R(
      () => ({
        stateKey: r,
        cogsState: c,
        getPluginMetaData: () => f.getState().getPluginMetaDataMap(r, [])?.get(e.name),
        setPluginMetaData: (o) => f.getState().setPluginMetaData(r, e.name, o),
        removePluginMetaData: () => f.getState().removePluginMetaData(r, [], e.name)
      }),
      [r, c, e.name]
    ), t = e.useHook ? e.useHook(a, n) : void 0, m = l();
    i(() => {
      e.transformState && (h(n, m.current) || (e.transformState(a, n, t), m.current = n));
    }, [a, e, n, t]);
    const s = l(t);
    return s.current = t, i(() => {
      if (!e.onUpdate)
        return;
      const o = (u) => {
        u.stateKey === r && e.onUpdate(r, u, n, s.current);
      };
      return b.getState().subscribeToUpdates(o);
    }, [r, e, n, a]), null;
  }
);
function E({ children: r }) {
  const [, e] = U((t) => t + 1, 0);
  i(() => b.subscribe(e), []);
  const { pluginOptions: n, stateHandlers: c, registeredPlugins: a } = b.getState();
  return /* @__PURE__ */ P(S, { children: [
    Array.from(n.entries()).map(([t, m]) => {
      const s = c.get(t);
      return s ? Array.from(m.entries()).map(([o, g]) => {
        const u = a.find((d) => d.name === o);
        return u ? /* @__PURE__ */ D(
          k,
          {
            stateKey: t,
            plugin: u,
            options: g,
            stateHandler: s
          },
          `${t}:${o}`
        ) : null;
      }) : null;
    }),
    r
  ] });
}
export {
  E as PluginRunner
};
//# sourceMappingURL=PluginRunner.jsx.map
