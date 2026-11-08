import { create as d } from "zustand";
const a = /* @__PURE__ */ new Map(), b = d((u, i) => ({
  stateHandlers: /* @__PURE__ */ new Map(),
  registerStateHandler: (e, s) => {
    const r = (i().stateHandlers.has(e) ? a.get(e) : void 0) ?? /* @__PURE__ */ new Map(), t = Symbol();
    return r.set(t, s), a.set(e, r), u((n) => {
      const o = new Map(n.stateHandlers);
      return o.set(e, s), { stateHandlers: o };
    }), () => {
      if (!(a.get(e) !== r || !r.delete(t)))
        if (r.size === 0)
          i().unregisterStateHandler(e);
        else {
          const n = Array.from(r.values()).pop();
          u((o) => {
            if (o.stateHandlers.get(e) === n)
              return o;
            const l = new Map(o.stateHandlers);
            return l.set(e, n), { stateHandlers: l };
          });
        }
    };
  },
  unregisterStateHandler: (e) => {
    a.delete(e), u((s) => {
      const r = new Map(s.stateHandlers), t = new Map(s.pluginOptions), n = new Map(s.hookResults);
      return r.delete(e), t.delete(e), n.delete(e), { stateHandlers: r, pluginOptions: t, hookResults: n };
    });
  },
  registeredPlugins: [],
  pluginOptions: /* @__PURE__ */ new Map(),
  setRegisteredPlugins: (e) => u({ registeredPlugins: e }),
  setPluginOptionsForState: (e, s) => u((r) => {
    const t = new Map(r.pluginOptions), n = /* @__PURE__ */ new Map();
    return Object.entries(s).forEach(([o, l]) => {
      r.registeredPlugins.some((p) => p.name === o) && n.set(o, l);
    }), n.size > 0 && t.set(e, n), { pluginOptions: t };
  }),
  getPluginConfigsForState: (e) => {
    const s = i(), r = s.pluginOptions.get(e);
    return r ? s.registeredPlugins.map((t) => {
      const n = r.get(t.name);
      return n !== void 0 ? { plugin: t, options: n } : null;
    }).filter(Boolean) : [];
  },
  updateSubscribers: /* @__PURE__ */ new Set(),
  subscribeToUpdates: (e) => (i().updateSubscribers.add(e), () => {
    i().updateSubscribers.delete(e);
  }),
  notifyUpdate: (e) => {
    i().updateSubscribers.forEach((s) => s(e));
  },
  formUpdateSubscribers: /* @__PURE__ */ new Set(),
  subscribeToFormUpdates: (e) => (i().formUpdateSubscribers.add(e), () => {
    i().formUpdateSubscribers.delete(e);
  }),
  notifyFormUpdate: (e) => {
    i().formUpdateSubscribers.forEach((s) => s(e));
  },
  hookResults: /* @__PURE__ */ new Map(),
  setHookResult: (e, s, r) => u((t) => {
    const n = new Map(t.hookResults), o = new Map(n.get(e) ?? /* @__PURE__ */ new Map());
    return r === void 0 ? o.delete(s) : o.set(s, r), o.size > 0 ? n.set(e, o) : n.delete(e), { hookResults: n };
  }),
  getHookResult: (e, s) => i().hookResults.get(e)?.get(s),
  removeHookResult: (e, s) => u((r) => {
    const t = new Map(r.hookResults), n = new Map(t.get(e) ?? /* @__PURE__ */ new Map());
    return n.delete(s), n.size > 0 ? t.set(e, n) : t.delete(e), { hookResults: t };
  })
}));
export {
  b as pluginStore
};
//# sourceMappingURL=pluginStore.js.map
