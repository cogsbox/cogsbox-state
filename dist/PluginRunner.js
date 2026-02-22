import { jsxs as F, Fragment as C, jsx as P } from "react/jsx-runtime";
import T, { useState as R, useMemo as M, useEffect as m, useRef as x, useReducer as N } from "react";
import { pluginStore as f } from "./pluginStore.js";
import { isDeepEqual as j } from "./utility.js";
import { createMetadataContext as A, toDeconstructedMethods as E, createScopedMetadataContext as H } from "./plugins.js";
const { setHookResult: O, removeHookResult: I } = f.getState(), $ = T.memo(
  ({
    stateKey: r,
    plugin: e,
    options: t,
    stateHandler: d
  }) => {
    const [b, a] = R(!0), c = M(
      () => A(r, e.name),
      [r, e.name]
    ), o = M(
      () => E(d),
      [d]
    ), i = M(
      () => ({
        stateKey: r,
        pluginName: e.name,
        isInitialMount: b,
        options: t,
        ...o,
        ...c
      }),
      [
        r,
        e.name,
        b,
        t,
        o,
        c
      ]
    ), s = e.useHook ? e.useHook(i) : void 0;
    m(() => {
      a(!1);
    }, []), m(() => (e.useHook ? O(r, e.name, s) : I(r, e.name), () => I(r, e.name)), [r, e.name, !!e.useHook, s]);
    const u = x(), [h, D] = R(!0);
    m(() => {
      e.transformState && (j(t, u.current) || (e.transformState({
        stateKey: r,
        pluginName: e.name,
        options: t,
        hookData: s,
        isInitialTransform: h,
        ...o,
        ...c
      }), u.current = t, D(!1)));
    }, [
      r,
      e,
      t,
      s,
      h,
      o,
      c
    ]);
    const k = x(s);
    return k.current = s, m(() => {
      if (!e.onUpdate) return;
      const S = (n) => {
        if (n.stateKey === r) {
          const U = H(
            r,
            e.name,
            n.path
          );
          e.onUpdate({
            stateKey: r,
            pluginName: e.name,
            update: n,
            path: n.path,
            options: t,
            hookData: k.current,
            ...o,
            ...U
            // <-- Use the new scoped context
          });
        }
      };
      return f.getState().subscribeToUpdates(S);
    }, [r, e, t, o]), m(() => {
      if (!e.onFormUpdate) return;
      const S = (n) => {
        if (n.stateKey === r) {
          const U = H(
            r,
            e.name,
            n.path
          );
          e.onFormUpdate({
            stateKey: r,
            pluginName: e.name,
            path: n.path,
            event: n,
            options: t,
            hookData: k.current,
            ...o,
            ...U
            // <-- Use the new scoped context
          });
        }
      };
      return f.getState().subscribeToFormUpdates(S);
    }, [r, e, t, o]), null;
  }
);
function J({ children: r }) {
  const [, e] = N((a) => a + 1, 0);
  m(() => f.subscribe(e), []);
  const { pluginOptions: t, stateHandlers: d, registeredPlugins: b } = f.getState();
  return /* @__PURE__ */ F(C, { children: [
    Array.from(t.entries()).map(([a, c]) => {
      const o = d.get(a);
      return o ? Array.from(c.entries()).map(([i, s]) => {
        const u = b.find((h) => h.name === i);
        return u ? /* @__PURE__ */ P(
          $,
          {
            stateKey: a,
            plugin: u,
            options: s,
            stateHandler: o
          },
          `${a}:${i}`
        ) : null;
      }) : null;
    }),
    r
  ] });
}
export {
  J as PluginRunner
};
//# sourceMappingURL=PluginRunner.js.map
