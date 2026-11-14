import { create as p } from "zustand";
const l = /* @__PURE__ */ new Map(), c = p((u, i) => ({
  stateHandlers: /* @__PURE__ */ new Map(),
  registerStateHandler: (e, s) => {
    const r = (i().stateHandlers.has(e) ? l.get(e) : void 0) ?? /* @__PURE__ */ new Map(), n = Symbol();
    return r.set(n, s), l.set(e, r), u((t) => {
      const o = new Map(t.stateHandlers);
      return o.set(e, s), { stateHandlers: o };
    }), () => {
      if (!(l.get(e) !== r || !r.delete(n)))
        if (r.size === 0)
          i().unregisterStateHandler(e);
        else {
          const t = Array.from(r.values()).pop();
          u((o) => {
            if (o.stateHandlers.get(e) === t)
              return o;
            const a = new Map(o.stateHandlers);
            return a.set(e, t), { stateHandlers: a };
          });
        }
    };
  },
  unregisterStateHandler: (e) => {
    l.delete(e), u((s) => {
      const r = new Map(s.stateHandlers), n = new Map(s.pluginOptions), t = new Map(s.hookResults);
      return r.delete(e), n.delete(e), t.delete(e), { stateHandlers: r, pluginOptions: n, hookResults: t };
    });
  },
  registeredPlugins: [],
  registeredPluginsByState: /* @__PURE__ */ new Map(),
  pluginOptions: /* @__PURE__ */ new Map(),
  getRegisteredPluginsForState: (e) => i().registeredPluginsByState.get(e) ?? i().registeredPlugins,
  setRegisteredPlugins: (e, s) => {
    if (!s) {
      u({ registeredPlugins: e });
      return;
    }
    u((r) => {
      const n = new Map(r.registeredPluginsByState);
      for (const t of s)
        n.set(t, e);
      return { registeredPluginsByState: n };
    });
  },
  setPluginOptionsForState: (e, s) => u((r) => {
    const n = new Map(r.pluginOptions), t = /* @__PURE__ */ new Map();
    return Object.entries(s).forEach(([o, a]) => {
      r.getRegisteredPluginsForState(e).some((d) => d.name === o) && t.set(o, a);
    }), t.size > 0 && n.set(e, t), { pluginOptions: n };
  }),
  getPluginConfigsForState: (e) => {
    const s = i(), r = s.pluginOptions.get(e);
    return r ? s.getRegisteredPluginsForState(e).map((n) => {
      const t = r.get(n.name);
      return t !== void 0 ? { plugin: n, options: t } : null;
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
  setHookResult: (e, s, r) => u((n) => {
    const t = new Map(n.hookResults), o = new Map(t.get(e) ?? /* @__PURE__ */ new Map());
    return r === void 0 ? o.delete(s) : o.set(s, r), o.size > 0 ? t.set(e, o) : t.delete(e), { hookResults: t };
  }),
  getHookResult: (e, s) => i().hookResults.get(e)?.get(s),
  removeHookResult: (e, s) => u((r) => {
    const n = new Map(r.hookResults), t = new Map(n.get(e) ?? /* @__PURE__ */ new Map());
    return t.delete(s), t.size > 0 ? n.set(e, t) : n.delete(e), { hookResults: n };
  })
}));
export {
  c as pluginStore
};
//# sourceMappingURL=pluginStore.js.map
