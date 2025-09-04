import { create as d } from "zustand";
const c = d((o, t) => ({
  stateHandlers: /* @__PURE__ */ new Map(),
  registerStateHandler: (e, s) => o((n) => {
    const r = new Map(n.stateHandlers);
    return r.set(e, s), console.log("addign handler", e, s), { stateHandlers: r };
  }),
  registeredPlugins: [],
  pluginOptions: /* @__PURE__ */ new Map(),
  setRegisteredPlugins: (e) => o({ registeredPlugins: e }),
  setPluginOptionsForState: (e, s) => o((n) => {
    const r = new Map(n.pluginOptions), i = /* @__PURE__ */ new Map();
    return Object.entries(s).forEach(([u, a]) => {
      n.registeredPlugins.some((p) => p.name === u) && i.set(u, a);
    }), i.size > 0 && r.set(e, i), { pluginOptions: r };
  }),
  getPluginConfigsForState: (e) => {
    const s = t(), n = s.pluginOptions.get(e);
    return n ? s.registeredPlugins.map((r) => {
      const i = n.get(r.name);
      return i !== void 0 ? { plugin: r, options: i } : null;
    }).filter(Boolean) : [];
  },
  updateSubscribers: /* @__PURE__ */ new Set(),
  subscribeToUpdates: (e) => (t().updateSubscribers.add(e), () => {
    t().updateSubscribers.delete(e);
  }),
  notifyUpdate: (e) => {
    t().updateSubscribers.forEach((s) => s(e));
  },
  formUpdateSubscribers: /* @__PURE__ */ new Set(),
  subscribeToFormUpdates: (e) => (t().formUpdateSubscribers.add(e), () => {
    t().formUpdateSubscribers.delete(e);
  }),
  notifyFormUpdate: (e) => {
    t().formUpdateSubscribers.forEach((s) => s(e));
  }
}));
export {
  c as pluginStore
};
//# sourceMappingURL=pluginStore.js.map
