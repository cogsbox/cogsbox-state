import { getGlobalStore as r } from "./store.js";
function V(t, e) {
  return {
    // Root metadata functions
    getPluginMetaData: () => r.getState().getPluginMetaDataMap(t, [])?.get(e),
    setPluginMetaData: (s) => r.getState().setPluginMetaData(t, [], e, s),
    removePluginMetaData: () => r.getState().removePluginMetaData(t, [], e),
    // Field metadata functions
    getFieldMetaData: (s) => r.getState().getPluginMetaDataMap(t, s)?.get(e),
    setFieldMetaData: (s, a) => r.getState().setPluginMetaData(t, s, e, a),
    removeFieldMetaData: (s) => r.getState().removePluginMetaData(t, s, e)
  };
}
function S() {
  function t(e) {
    const s = (n, i, c, o, g) => ({
      name: e,
      useHook: n,
      transformState: i,
      onUpdate: c,
      onFormUpdate: o,
      formWrapper: g
    });
    function a(n, i, c, o, g) {
      const D = s(
        n,
        i,
        c,
        o,
        g
      ), P = {};
      return i || (P.transformState = (u) => a(n, u, c, o, g)), c || (P.onUpdate = (u) => a(n, i, u, o, g)), o || (P.onFormUpdate = (u) => a(
        n,
        i,
        c,
        u,
        g
      )), g || (P.formWrapper = (u) => a(n, i, c, o, u)), Object.assign(D, P);
    }
    return Object.assign(
      a(),
      {
        /**
         * Define a React hook for this plugin.
         * Sets up subscriptions, state, and returns data for other methods.
         */
        useHook(n) {
          return a(n);
        }
      }
    );
  }
  return { createPlugin: t };
}
const { createPlugin: l } = S();
l("analyticsPlugin").transformState(
  ({ stateKey: t, cogsState: e, setPluginMetaData: s }) => {
    t === "user" && (e.$update({ test: "This works!", email: "test@example.com" }), s({ lastUpdated: /* @__PURE__ */ new Date() }));
  }
);
l("sync").useHook(({ setPluginMetaData: t, setFieldMetaData: e, cogsState: s }) => {
  const a = "session-123";
  return t({ sessionId: a }), e(["user"], { syncVersion: "v1.0" }), e(["address"], { syncVersion: "v1.1" }), { sessionId: a };
}).onUpdate(({ path: t, update: e, getFieldMetaData: s, setFieldMetaData: a }) => {
  if (t) {
    const M = s(t)?.syncVersion || "v0", n = `v${parseInt(M.slice(1)) + 1}`;
    a(t, { syncVersion: n });
  }
});
export {
  V as createMetadataContext,
  S as createPluginContext
};
//# sourceMappingURL=plugins.js.map
