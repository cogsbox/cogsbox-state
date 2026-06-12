import { jsxs as N, Fragment as C, jsx as P } from "react/jsx-runtime";
import T, { useState as x, useMemo as i, useEffect as f, useRef as R, useSyncExternalStore as E } from "react";
import { pluginStore as m } from "./pluginStore.js";
import { isDeepEqual as j } from "./utility.js";
import { createMetadataContext as O, toDeconstructedMethods as $, createScopedMetadataContext as H } from "./plugins.js";
const { setHookResult: q, removeHookResult: I } = m.getState(), A = T.memo(
  ({
    stateKey: t,
    plugin: e,
    options: r,
    stateHandler: d
  }) => {
    const [u, a] = x(!0), s = i(
      () => O(t, e.name),
      [t, e.name]
    ), o = i(
      () => $(d),
      [d]
    ), h = i(
      () => ({
        stateKey: t,
        pluginName: e.name,
        isInitialMount: u,
        options: r,
        ...o,
        ...s
      }),
      [
        t,
        e.name,
        u,
        r,
        o,
        s
      ]
    ), c = e.useHook ? e.useHook(h) : void 0;
    f(() => {
      a(!1);
    }, []), f(() => (e.useHook ? q(t, e.name, c) : I(t, e.name), () => I(t, e.name)), [t, e.name, !!e.useHook, c]);
    const U = R(), [M, D] = x(!0);
    f(() => {
      e.transformState && (j(r, U.current) || (e.transformState({
        stateKey: t,
        pluginName: e.name,
        options: r,
        hookData: c,
        isInitialTransform: M,
        ...o,
        ...s
      }), U.current = r, D(!1)));
    }, [
      t,
      e,
      r,
      c,
      M,
      o,
      s
    ]);
    const b = R(c);
    return b.current = c, f(() => {
      if (!e.onUpdate) return;
      const S = (n) => {
        if (n.stateKey === t) {
          const k = H(
            t,
            e.name,
            n.path
          );
          e.onUpdate({
            stateKey: t,
            pluginName: e.name,
            update: n,
            path: n.path,
            options: r,
            hookData: b.current,
            ...o,
            ...k
          });
        }
      };
      return m.getState().subscribeToUpdates(S);
    }, [t, e, r, o]), f(() => {
      if (!e.onFormUpdate) return;
      const S = (n) => {
        if (n.stateKey === t) {
          const k = H(
            t,
            e.name,
            n.path
          );
          e.onFormUpdate({
            stateKey: t,
            pluginName: e.name,
            path: n.path,
            event: n,
            options: r,
            hookData: b.current,
            ...o,
            ...k
            // <-- Use the new scoped context
          });
        }
      };
      return m.getState().subscribeToFormUpdates(S);
    }, [t, e, r, o]), null;
  }
);
function L({ children: t }) {
  const { pluginOptions: e, stateHandlers: r, registeredPlugins: d } = E(
    m.subscribe,
    () => m.getState(),
    () => m.getState()
  ), u = (a) => !!(a.useHook || a.transformState || a.onUpdate || a.onFormUpdate);
  return /* @__PURE__ */ N(C, { children: [
    Array.from(r.entries()).flatMap(
      ([a, s]) => d.filter(u).map((o) => {
        const h = e.get(a)?.get(o.name) ?? {};
        return /* @__PURE__ */ P(
          A,
          {
            stateKey: a,
            plugin: o,
            options: h,
            stateHandler: s
          },
          `${a}:${o.name}`
        );
      })
    ),
    t
  ] });
}
export {
  L as PluginRunner
};
//# sourceMappingURL=PluginRunner.js.map
