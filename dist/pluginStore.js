import { create as l } from "zustand";
const b = l((u, o) => ({
  stateHandlers: /* @__PURE__ */ new Map(),
  registerStateHandler: (e, s) => u((n) => {
    const t = new Map(n.stateHandlers);
    return t.set(e, s), console.log("addign handler", e, s), { stateHandlers: t };
  }),
  registeredPlugins: [],
  pluginOptions: /* @__PURE__ */ new Map(),
  setRegisteredPlugins: (e) => u({ registeredPlugins: e }),
  setPluginOptionsForState: (e, s) => u((n) => {
    const t = new Map(n.pluginOptions), r = /* @__PURE__ */ new Map();
    return Object.entries(s).forEach(([i, p]) => {
      n.registeredPlugins.some((a) => a.name === i) && r.set(i, p);
    }), r.size > 0 && t.set(e, r), { pluginOptions: t };
  }),
  getPluginConfigsForState: (e) => {
    const s = o(), n = s.pluginOptions.get(e);
    return n ? s.registeredPlugins.map((t) => {
      const r = n.get(t.name);
      return r !== void 0 ? { plugin: t, options: r } : null;
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
  setHookResult: (e, s, n) => u((t) => {
    const r = new Map(t.hookResults), i = new Map(r.get(e) ?? /* @__PURE__ */ new Map());
    return n === void 0 ? i.delete(s) : i.set(s, n), i.size > 0 ? r.set(e, i) : r.delete(e), { hookResults: r };
  }),
  getHookResult: (e, s) => o().hookResults.get(e)?.get(s),
  removeHookResult: (e, s) => u((n) => {
    const t = new Map(n.hookResults), r = new Map(t.get(e) ?? /* @__PURE__ */ new Map());
    return r.delete(s), r.size > 0 ? t.set(e, r) : t.delete(e), { hookResults: t };
  })
}));
export {
  b as pluginStore
};
//# sourceMappingURL=pluginStore.js.map
