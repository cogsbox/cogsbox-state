import { jsxs as D, Fragment as F, jsx as M } from "react/jsx-runtime";
import P, { useState as S, useMemo as R, useEffect as m, useRef as l, useReducer as T } from "react";
import { pluginStore as f } from "./pluginStore.js";
import { isDeepEqual as C } from "./utility.js";
import { createMetadataContext as N, toDeconstructedMethods as j } from "./plugins.js";
const { setHookResult: A, removeHookResult: H } = f.getState(), E = P.memo(
  ({
    stateKey: r,
    plugin: e,
    options: t,
    stateHandler: d
  }) => {
    const [i, s] = S(!0), n = R(
      () => N(r, e.name),
      [r, e.name]
    ), o = R(
      () => j(d),
      [d]
    ), b = R(
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
    }, []), m(() => (e.useHook ? A(r, e.name, a) : H(r, e.name), () => H(r, e.name)), [r, e.name, !!e.useHook, a]);
    const u = l(), [h, I] = S(!0);
    m(() => {
      e.transformState && (C(t, u.current) || (e.transformState({
        stateKey: r,
        pluginName: e.name,
        options: t,
        hookData: a,
        isInitialTransform: h,
        ...o,
        ...n
      }), u.current = t, I(!1)));
    }, [
      r,
      e,
      t,
      a,
      h,
      o,
      n
    ]);
    const k = l(a);
    return k.current = a, m(() => {
      if (!e.onUpdate) return;
      const U = (c) => {
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
      return f.getState().subscribeToUpdates(U);
    }, [r, e, t, o, n]), m(() => {
      if (!e.onFormUpdate) return;
      const U = (c) => {
        c.stateKey === r && e.onFormUpdate({
          stateKey: r,
          pluginName: e.name,
          path: c.path,
          event: c,
          // Pass the whole event through, not a transformed version
          options: t,
          hookData: k.current,
          ...o,
          ...n
        });
      };
      return f.getState().subscribeToFormUpdates(U);
    }, [r, e, t, o, n]), null;
  }
);
function z({ children: r }) {
  const [, e] = T((s) => s + 1, 0);
  m(() => f.subscribe(e), []);
  const { pluginOptions: t, stateHandlers: d, registeredPlugins: i } = f.getState();
  return /* @__PURE__ */ D(F, { children: [
    Array.from(t.entries()).map(([s, n]) => {
      const o = d.get(s);
      return o ? Array.from(n.entries()).map(([b, a]) => {
        const u = i.find((h) => h.name === b);
        return u ? /* @__PURE__ */ M(
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
  z as PluginRunner
};
//# sourceMappingURL=PluginRunner.jsx.map
