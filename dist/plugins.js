function l() {
  return {
    createPlugin() {
      const t = (e) => ({
        // The <TState> generic is REMOVED from transformState
        transformState(r) {
          return {
            onUpdate(i) {
              const u = {
                transformState: (n, s, o) => r(
                  n,
                  s,
                  ...o !== void 0 ? [o] : []
                ),
                onUpdate: (n, s, o) => i(
                  n,
                  s,
                  ...o !== void 0 ? [o] : []
                )
              };
              return e && (u.useHook = e), u;
            }
          };
        }
      });
      return {
        useHook(e) {
          return t(e);
        },
        ...t()
      };
    }
  };
}
l().createPlugin().useHook((t, e) => (console.log("test", t, e), { thisishoojoy: () => !0 })).transformState((t, e, r) => (console.log("test", t, e, r), r.thisishoojoy(), t)).onUpdate((t, e, r) => {
  console.log("test", t, e, r);
});
export {
  l as createPluginContext
};
//# sourceMappingURL=plugins.js.map
