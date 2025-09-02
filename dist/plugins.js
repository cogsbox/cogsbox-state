import { useState as m, useEffect as i } from "react";
function g() {
  function t(r) {
    const n = (e, a, u) => ({
      name: r,
      useHook: e,
      transformState: a,
      onUpdate: u
    }), o = (e) => {
      const a = n(e);
      return Object.assign(a, {
        transformState(u) {
          const d = n(
            e,
            u
          );
          return Object.assign(d, {
            onUpdate(f) {
              return n(
                e,
                u,
                f
              );
            }
          });
        },
        onUpdate(u) {
          return n(
            e,
            void 0,
            u
          );
        }
      });
    }, s = n();
    return Object.assign(s, {
      useHook(e) {
        return o(e);
      },
      transformState(e) {
        const a = n(
          void 0,
          e
        );
        return Object.assign(a, {
          onUpdate(u) {
            return n(
              void 0,
              e,
              u
            );
          }
        });
      },
      onUpdate(e) {
        return n(void 0, void 0, e);
      }
    });
  }
  return { createPlugin: t };
}
const P = ({
  plugin: t,
  pluginOptions: r,
  cogsContext: n,
  pluginDataRef: o
}) => {
  const s = t.useHook ? t.useHook(n, r) : void 0;
  return i(() => {
    t.transformState && (console.log(`▶️ Running transformState for plugin: "${t.name}"`), t.transformState(n, r, s));
  }, [t, r, n, s]), i(() => {
    const e = {
      plugin: t,
      options: r,
      hookData: s
    };
    return o.current.push(e), () => {
      o.current = o.current.filter(
        (a) => a.plugin.name !== t.name
      );
    };
  }, [t, r, s, o]), null;
}, { createPlugin: c } = g();
c("analyticsPlugin").transformState(
  ({ stateKey: t, cogsState: r }, n) => {
    t === "user" && r.$update({ test: "This works!" }), t === "address" && r.$update({ city: "London", country: "UK" });
  }
);
c("fullPlugin").useHook(({ stateKey: t, cogsState: r }, n) => {
  const [o, s] = m(0);
  return {
    count: o,
    increment: () => s((e) => e + 1)
  };
}).transformState(({ stateKey: t, cogsState: r }, n, o) => {
  o && console.log(
    `[Logger] RENDER: Key '${t}' has been updated ${o.count} times.`
  );
}).onUpdate(({ stateKey: t, cogsState: r }, n, o, s) => {
  s && (console.log(`[Logger] UPDATE: Key '${t}' just changed.`), s.increment());
});
c("hookOnly").useHook((t, r) => ({ id: "test" }));
c("empty");
export {
  P as PluginExecutor,
  g as createPluginContext
};
//# sourceMappingURL=plugins.js.map
