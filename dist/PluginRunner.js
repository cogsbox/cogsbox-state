import { jsxs as p, Fragment as D, jsx as F } from "react/jsx-runtime";
import C, { useState as x, useMemo as b, useEffect as i, useRef as I, useSyncExternalStore as T } from "react";
import { pluginStore as d } from "./pluginStore.js";
import { isDeepEqual as $ } from "./utility.js";
import { createMetadataContext as j, toDeconstructedMethods as O, createScopedMetadataContext as M } from "./plugins.js";
const { setHookResult: N, removeHookResult: U } = d.getState(), q = C.memo(
  ({
    stateKey: e,
    plugin: t,
    options: o,
    stateHandler: r
  }) => {
    const [u, c] = x(!0), m = b(
      () => j(e, t.name),
      [e, t.name]
    ), n = b(
      () => O(r),
      [r]
    ), f = b(
      () => ({
        stateKey: e,
        pluginName: t.name,
        isInitialMount: u,
        options: o,
        ...n,
        ...m
      }),
      [
        e,
        t.name,
        u,
        o,
        n,
        m
      ]
    ), s = t.useHook ? t.useHook(f) : void 0;
    i(() => {
      c(!1);
    }, []), i(() => (t.useHook ? N(e, t.name, s) : U(e, t.name), () => U(e, t.name)), [e, t.name, !!t.useHook, s]);
    const h = I(), [H, P] = x(!0);
    i(() => {
      t.transformState && ($(o, h.current) || (t.transformState({
        stateKey: e,
        pluginName: t.name,
        options: o,
        hookData: s,
        isInitialTransform: H,
        ...n,
        ...m
      }), h.current = o, P(!1)));
    }, [
      e,
      t,
      o,
      s,
      H,
      n,
      m
    ]);
    const k = I(s);
    return k.current = s, i(() => {
      if (!t.onUpdate) return;
      const S = (a) => {
        if (a.stateKey === e) {
          const l = M(
            e,
            t.name,
            a.path
          );
          t.onUpdate({
            stateKey: e,
            pluginName: t.name,
            update: a,
            path: a.path,
            options: o,
            hookData: k.current,
            ...n,
            ...l
          });
        }
      };
      return d.getState().subscribeToUpdates(S);
    }, [e, t, o, n]), i(() => {
      if (!t.onFormUpdate) return;
      const S = (a) => {
        if (a.stateKey === e) {
          const l = M(
            e,
            t.name,
            a.path
          );
          t.onFormUpdate({
            stateKey: e,
            pluginName: t.name,
            path: a.path,
            event: a,
            options: o,
            hookData: k.current,
            ...n,
            ...l
          });
        }
      };
      return d.getState().subscribeToFormUpdates(S);
    }, [e, t, o, n]), null;
  }
);
function E() {
  const { pluginOptions: e, stateHandlers: t, registeredPlugins: o } = d.getState(), r = [];
  return e.forEach((u, c) => {
    t.has(c) && u.forEach((m, n) => {
      o.some((f) => f.name === n) && r.push(`${c}:${n}`);
    });
  }), r.sort().join("|");
}
function g() {
  const { pluginOptions: e, stateHandlers: t, registeredPlugins: o } = d.getState(), r = [];
  return e.forEach((u, c) => {
    const m = t.get(c);
    m && u.forEach((n, f) => {
      const s = o.find((h) => h.name === f);
      s && r.push({
        key: `${c}:${f}`,
        stateKey: c,
        plugin: s,
        options: n,
        stateHandler: m
      });
    });
  }), r;
}
function J({ children: e }) {
  const t = T(
    d.subscribe,
    E,
    E
    // SSR fallback
  ), o = b(() => g(), [t]);
  return /* @__PURE__ */ p(D, { children: [
    o.map((r) => /* @__PURE__ */ F(
      q,
      {
        stateKey: r.stateKey,
        plugin: r.plugin,
        options: r.options,
        stateHandler: r.stateHandler
      },
      r.key
    )),
    e
  ] });
}
export {
  J as PluginRunner
};
//# sourceMappingURL=PluginRunner.js.map
