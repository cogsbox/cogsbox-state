import { jsxs as l, Fragment as M, jsx as P } from "react/jsx-runtime";
import T, { useState as U, useMemo as R, useEffect as u, useRef as I, useReducer as C } from "react";
import { pluginStore as f } from "./pluginStore.js";
import { isDeepEqual as j } from "./utility.js";
import { createMetadataContext as v } from "./plugins.js";
const { setHookResult: A, removeHookResult: x } = f.getState(), E = T.memo(
  ({
    stateKey: e,
    plugin: r,
    options: t,
    stateHandler: o
  }) => {
    const [i, c] = U(!0), n = R(
      () => v(e, r.name),
      [e, r.name]
    ), b = R(
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
    }, []), u(() => (r.useHook ? A(e, r.name, s) : x(e, r.name), () => x(e, r.name)), [e, r.name, !!r.useHook, s]);
    const d = I(), [m, h] = U(!0);
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
    const S = I(s);
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
          const F = a.path.split(".");
          r.onFormUpdate({
            stateKey: e,
            cogsState: o,
            ...n,
            path: F,
            event: {
              type: a.type,
              value: a.value
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
  return /* @__PURE__ */ l(M, { children: [
    Array.from(t.entries()).map(([c, n]) => {
      const b = o.get(c);
      return b ? Array.from(n.entries()).map(([s, d]) => {
        const m = i.find((h) => h.name === s);
        return m ? /* @__PURE__ */ P(
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
