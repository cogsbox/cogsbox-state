import { jsxs as M, Fragment as P, jsx as T } from "react/jsx-runtime";
import l, { useState as R, useMemo as I, useEffect as u, useRef as x, useReducer as C } from "react";
import { pluginStore as f } from "./pluginStore.js";
import { isDeepEqual as j } from "./utility.js";
import { createMetadataContext as v } from "./plugins.js";
const { setHookResult: A, removeHookResult: D } = f.getState(), E = l.memo(
  ({
    stateKey: e,
    plugin: r,
    options: t,
    stateHandler: o
  }) => {
    const [i, c] = R(!0), n = I(
      () => v(e, r.name),
      [e, r.name]
    ), b = I(
      () => ({
        stateKey: e,
        cogsState: o,
        ...n,
        options: t,
        pluginName: r.name,
        isInitialMount: i
      }),
      [
        e,
        o,
        n,
        t,
        r.name,
        i
      ]
    ), s = r.useHook ? r.useHook(b) : void 0;
    u(() => {
      c(!1);
    }, []), u(() => (r.useHook ? A(e, r.name, s) : D(e, r.name), () => D(e, r.name)), [e, r.name, !!r.useHook, s]);
    const d = x(), [m, h] = R(!0);
    u(() => {
      r.transformState && (j(t, d.current) || (r.transformState({
        stateKey: e,
        cogsState: o,
        ...n,
        options: t,
        hookData: s,
        isInitialTransform: m
      }), d.current = t, h(!1)));
    }, [
      e,
      o,
      n,
      r,
      t,
      s,
      m
    ]);
    const S = x(s);
    return S.current = s, u(() => {
      if (!r.onUpdate) return;
      const k = (a) => {
        a.stateKey === e && r.onUpdate({
          stateKey: e,
          cogsState: o,
          ...n,
          update: a,
          path: a.path,
          options: t,
          hookData: S.current
        });
      };
      return f.getState().subscribeToUpdates(k);
    }, [e, o, n, r, t]), u(() => {
      if (!r.onFormUpdate) return;
      const k = (a) => {
        if (a.stateKey === e) {
          const U = a.path;
          r.onFormUpdate({
            stateKey: e,
            cogsState: o,
            ...n,
            path: U,
            event: {
              type: a.type,
              value: a.value,
              path: U
            },
            options: t,
            hookData: S.current
          });
        }
      };
      return f.getState().subscribeToFormUpdates(k);
    }, [e, o, n, r, t]), null;
  }
);
function z({ children: e }) {
  const [, r] = C((c) => c + 1, 0);
  u(() => f.subscribe(r), []);
  const { pluginOptions: t, stateHandlers: o, registeredPlugins: i } = f.getState();
  return /* @__PURE__ */ M(P, { children: [
    Array.from(t.entries()).map(([c, n]) => {
      const b = o.get(c);
      return b ? Array.from(n.entries()).map(([s, d]) => {
        const m = i.find((h) => h.name === s);
        return m ? /* @__PURE__ */ T(
          E,
          {
            stateKey: c,
            plugin: m,
            options: d,
            stateHandler: b
          },
          `${c}:${s}`
        ) : null;
      }) : null;
    }),
    e
  ] });
}
export {
  z as PluginRunner
};
//# sourceMappingURL=PluginRunner.jsx.map
