import { create as l } from "zustand";
const b = l((u, o) => ({
  stateHandlers: /* @__PURE__ */ new Map(),
  registerStateHandler: (e, s) => u((t) => {
    const r = new Map(t.stateHandlers);
    return r.set(e, s), { stateHandlers: r };
  }),
  unregisterStateHandler: (e) => u((s) => {
    const t = new Map(s.stateHandlers);
    return t.delete(e), { stateHandlers: t };
  }),
  registeredPlugins: [],
  pluginOptions: /* @__PURE__ */ new Map(),
  setRegisteredPlugins: (e) => u({ registeredPlugins: e }),
  setPluginOptionsForState: (e, s) => u((t) => {
    const r = new Map(t.pluginOptions), n = /* @__PURE__ */ new Map();
    return Object.entries(s).forEach(([i, a]) => {
      t.registeredPlugins.some((p) => p.name === i) && n.set(i, a);
    }), n.size > 0 && r.set(e, n), { pluginOptions: r };
  }),
  getPluginConfigsForState: (e) => {
    const s = o(), t = s.pluginOptions.get(e);
    return t ? s.registeredPlugins.map((r) => {
      const n = t.get(r.name);
      return n !== void 0 ? { plugin: r, options: n } : null;
    }).filter(Boolean) : [];
  },
  updateSubscribers: /* @__PURE__ */ new Set(),
  subscribeToUpdates: (e) => (o().updateSubscribers.add(e), () => {
    o().updateSubscribers.delete(e);
  }),
  notifyUpdate: (e) => {
    o().updateSubscribers.forEach((s) => s(e));
  },
  formUpdateSubscribers: /* @__PURE__ */ new Set(),
  subscribeToFormUpdates: (e) => (o().formUpdateSubscribers.add(e), () => {
    o().formUpdateSubscribers.delete(e);
  }),
  notifyFormUpdate: (e) => {
    o().formUpdateSubscribers.forEach((s) => s(e));
  },
  hookResults: /* @__PURE__ */ new Map(),
  setHookResult: (e, s, t) => u((r) => {
    const n = new Map(r.hookResults), i = new Map(n.get(e) ?? /* @__PURE__ */ new Map());
    return t === void 0 ? i.delete(s) : i.set(s, t), i.size > 0 ? n.set(e, i) : n.delete(e), { hookResults: n };
  }),
  getHookResult: (e, s) => o().hookResults.get(e)?.get(s),
  removeHookResult: (e, s) => u((t) => {
    const r = new Map(t.hookResults), n = new Map(r.get(e) ?? /* @__PURE__ */ new Map());
    return n.delete(s), n.size > 0 ? r.set(e, n) : r.delete(e), { hookResults: r };
  })
}));
export {
  b as pluginStore
};
//# sourceMappingURL=pluginStore.js.map
