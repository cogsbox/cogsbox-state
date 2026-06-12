import { jsxs as N, Fragment as C, jsx as E } from "react/jsx-runtime";
import P, { useState as x, useMemo as i, useEffect as u, useRef as R, useLayoutEffect as T, useSyncExternalStore as j } from "react";
import { pluginStore as m } from "./pluginStore.js";
import { isDeepEqual as O } from "./utility.js";
import { createMetadataContext as $, toDeconstructedMethods as q, createScopedMetadataContext as H } from "./plugins.js";
const { setHookResult: A, removeHookResult: I } = m.getState(), L = P.memo(
  ({
    stateKey: t,
    plugin: e,
    options: o,
    stateHandler: f
  }) => {
    const [d, a] = x(!0), s = i(
      () => $(t, e.name),
      [t, e.name]
    ), r = i(
      () => q(f),
      [f]
    ), h = i(
      () => ({
        stateKey: t,
        pluginName: e.name,
        isInitialMount: d,
        options: o,
        ...r,
        ...s
      }),
      [
        t,
        e.name,
        d,
        o,
        r,
        s
      ]
    ), c = e.useHook ? e.useHook(h) : void 0;
    u(() => {
      a(!1);
    }, []), u(() => (e.useHook ? A(t, e.name, c) : I(t, e.name), () => I(t, e.name)), [t, e.name, !!e.useHook, c]);
    const U = R(), [M, D] = x(!0);
    T(() => {
      e.transformState && (O(o, U.current) || (e.transformState({
        stateKey: t,
        pluginName: e.name,
        options: o,
        hookData: c,
        isInitialTransform: M,
        ...r,
        ...s
      }), U.current = o, D(!1)));
    }, [
      t,
      e,
      o,
      c,
      M,
      r,
      s
    ]);
    const b = R(c);
    return b.current = c, u(() => {
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
            options: o,
            hookData: b.current,
            ...r,
            ...k
          });
        }
      };
      return m.getState().subscribeToUpdates(S);
    }, [t, e, o, r]), u(() => {
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
            options: o,
            hookData: b.current,
            ...r,
            ...k
            // <-- Use the new scoped context
          });
        }
      };
      return m.getState().subscribeToFormUpdates(S);
    }, [t, e, o, r]), null;
  }
);
function Q({ children: t }) {
  const { pluginOptions: e, stateHandlers: o, registeredPlugins: f } = j(
    m.subscribe,
    () => m.getState(),
    () => m.getState()
  ), d = (a) => !!(a.useHook || a.transformState || a.onUpdate || a.onFormUpdate);
  return /* @__PURE__ */ N(C, { children: [
    Array.from(o.entries()).flatMap(
      ([a, s]) => f.filter(d).map((r) => {
        const h = e.get(a)?.get(r.name) ?? {};
        return /* @__PURE__ */ E(
          L,
          {
            stateKey: a,
            plugin: r,
            options: h,
            stateHandler: s
          },
          `${a}:${r.name}`
        );
      })
    ),
    t
  ] });
}
export {
  Q as PluginRunner
};
//# sourceMappingURL=PluginRunner.js.map
