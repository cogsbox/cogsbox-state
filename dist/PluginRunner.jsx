import { jsxs as F, Fragment as M, jsx as P } from "react/jsx-runtime";
import T, { useState as S, useMemo as U, useEffect as m, useRef as H, useReducer as C } from "react";
import { pluginStore as f } from "./pluginStore.js";
import { isDeepEqual as N } from "./utility.js";
import { createMetadataContext as j, toDeconstructedMethods as v } from "./plugins.js";
const { setHookResult: A, removeHookResult: I } = f.getState(), E = T.memo(
  ({
    stateKey: r,
    plugin: e,
    options: t,
    stateHandler: d
  }) => {
    const [i, s] = S(!0), n = U(
      () => j(r, e.name),
      [r, e.name]
    ), o = U(
      () => v(d),
      [d]
    ), b = U(
      () => ({
        stateKey: r,
        pluginName: e.name,
        isInitialMount: i,
        options: t,
        ...o,
        ...n
      }),
      [
        r,
        e.name,
        i,
        t,
        o,
        n
      ]
    ), a = e.useHook ? e.useHook(b) : void 0;
    m(() => {
      s(!1);
    }, []), m(() => (e.useHook ? A(r, e.name, a) : I(r, e.name), () => I(r, e.name)), [r, e.name, !!e.useHook, a]);
    const u = H(), [h, x] = S(!0);
    m(() => {
      e.transformState && (N(t, u.current) || (e.transformState({
        stateKey: r,
        pluginName: e.name,
        options: t,
        hookData: a,
        isInitialTransform: h,
        ...o,
        ...n
      }), u.current = t, x(!1)));
    }, [
      r,
      e,
      t,
      a,
      h,
      o,
      n
    ]);
    const k = H(a);
    return k.current = a, m(() => {
      if (!e.onUpdate) return;
      const l = (c) => {
        c.stateKey === r && e.onUpdate({
          stateKey: r,
          pluginName: e.name,
          update: c,
          path: c.path,
          options: t,
          hookData: k.current,
          ...o,
          ...n
        });
      };
      return f.getState().subscribeToUpdates(l);
    }, [r, e, t, o, n]), m(() => {
      if (!e.onFormUpdate) return;
      const l = (c) => {
        if (c.stateKey === r) {
          const R = c.path;
          e.onFormUpdate({
            stateKey: r,
            pluginName: e.name,
            path: R,
            event: {
              type: c.type,
              value: c.value,
              path: R
            },
            options: t,
            hookData: k.current,
            ...o,
            ...n
          });
        }
      };
      return f.getState().subscribeToFormUpdates(l);
    }, [r, e, t, o, n]), null;
  }
);
function B({ children: r }) {
  const [, e] = C((s) => s + 1, 0);
  m(() => f.subscribe(e), []);
  const { pluginOptions: t, stateHandlers: d, registeredPlugins: i } = f.getState();
  return /* @__PURE__ */ F(M, { children: [
    Array.from(t.entries()).map(([s, n]) => {
      const o = d.get(s);
      return o ? Array.from(n.entries()).map(([b, a]) => {
        const u = i.find((h) => h.name === b);
        return u ? /* @__PURE__ */ P(
          E,
          {
            stateKey: s,
            plugin: u,
            options: a,
            stateHandler: o
          },
          `${s}:${b}`
        ) : null;
      }) : null;
    }),
    r
  ] });
}
export {
  B as PluginRunner
};
//# sourceMappingURL=PluginRunner.jsx.map
