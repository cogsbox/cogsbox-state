import { jsxs as D, Fragment as U, jsx as k } from "react/jsx-runtime";
import M, { useMemo as R, useEffect as c, useRef as S, useReducer as h } from "react";
import { pluginStore as m } from "./pluginStore.js";
import { getGlobalStore as i } from "./store.js";
import { isDeepEqual as H } from "./utility.js";
const { setHookResult: g, removeHookResult: l } = m.getState(), F = M.memo(
  ({
    stateKey: r,
    plugin: e,
    options: o,
    stateHandler: f
  }) => {
    const s = R(
      () => ({
        stateKey: r,
        cogsState: f,
        getPluginMetaData: () => i.getState().getPluginMetaDataMap(r, [])?.get(e.name),
        setPluginMetaData: (n) => i.getState().setPluginMetaData(r, e.name, n),
        removePluginMetaData: () => i.getState().removePluginMetaData(r, [], e.name)
      }),
      [r, f, e.name]
    ), t = e.useHook ? e.useHook(s, o) : void 0;
    c(() => (e.useHook ? g(r, e.name, t) : l(r, e.name), () => l(r, e.name)), [r, e.name, !!e.useHook, t]);
    const b = S();
    c(() => {
      e.transformState && (H(o, b.current) || (e.transformState(s, o, t), b.current = o));
    }, [s, e, o, t]);
    const u = S(t);
    return u.current = t, c(() => {
      if (!e.onUpdate)
        return;
      const n = (a) => {
        a.stateKey === r && e.onUpdate(r, a, o, u.current);
      };
      return m.getState().subscribeToUpdates(n);
    }, [r, e, o, s]), c(() => {
      if (!e.onFormUpdate)
        return;
      const n = (a) => {
        a.stateKey === r && e.onFormUpdate(
          r,
          {
            type: a.type,
            path: a.path,
            value: a.value
          },
          o,
          u.current
        );
      };
      return m.getState().subscribeToFormUpdates(n);
    }, [r, e, o]), null;
  }
);
function O({ children: r }) {
  const [, e] = h((t) => t + 1, 0);
  c(() => m.subscribe(e), []);
  const { pluginOptions: o, stateHandlers: f, registeredPlugins: s } = m.getState();
  return /* @__PURE__ */ D(U, { children: [
    Array.from(o.entries()).map(([t, b]) => {
      const u = f.get(t);
      return u ? Array.from(b.entries()).map(([n, d]) => {
        const a = s.find((P) => P.name === n);
        return a ? /* @__PURE__ */ k(
          F,
          {
            stateKey: t,
            plugin: a,
            options: d,
            stateHandler: u
          },
          `${t}:${n}`
        ) : null;
      }) : null;
    }),
    r
  ] });
}
export {
  O as PluginRunner
};
//# sourceMappingURL=PluginRunner.jsx.map
