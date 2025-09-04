import { create as d } from "zustand";
const l = d((o, i) => ({
  stateHandlers: /* @__PURE__ */ new Map(),
  registerStateHandler: (e, t) => o((n) => {
    const s = new Map(n.stateHandlers);
    return s.set(e, t), console.log("addign handler", e, t), { stateHandlers: s };
  }),
  registeredPlugins: [],
  pluginOptions: /* @__PURE__ */ new Map(),
  setRegisteredPlugins: (e) => o({ registeredPlugins: e }),
  setPluginOptionsForState: (e, t) => o((n) => {
    const s = new Map(n.pluginOptions), r = /* @__PURE__ */ new Map();
    return Object.entries(t).forEach(([a, u]) => {
      n.registeredPlugins.some((p) => p.name === a) && r.set(a, u);
    }), r.size > 0 && s.set(e, r), { pluginOptions: s };
  }),
  getPluginConfigsForState: (e) => {
    const t = i(), n = t.pluginOptions.get(e);
    return n ? t.registeredPlugins.map((s) => {
      const r = n.get(s.name);
      return r !== void 0 ? { plugin: s, options: r } : null;
    }).filter(Boolean) : [];
  },
  updateSubscribers: /* @__PURE__ */ new Set(),
  subscribeToUpdates: (e) => (i().updateSubscribers.add(e), () => {
    i().updateSubscribers.delete(e);
  }),
  notifyUpdate: (e) => {
    i().updateSubscribers.forEach((t) => t(e));
  }
}));
export {
  l as pluginStore
};
//# sourceMappingURL=pluginStore.js.map
