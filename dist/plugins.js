import { useState as U } from "react";
function l() {
  function o(r) {
    const e = (t, u, n, a) => ({
      name: r,
      useHook: t,
      transformState: u,
      onUpdate: n,
      onFormUpdate: a
    }), s = (t) => {
      const u = e(t);
      return Object.assign(u, {
        transformState(n) {
          const a = e(
            t,
            n
          );
          return Object.assign(a, {
            onUpdate(i) {
              const p = e(
                t,
                n,
                i
              );
              return Object.assign(p, {
                onFormUpdate(g) {
                  return e(
                    t,
                    n,
                    i,
                    g
                  );
                }
              });
            },
            onFormUpdate(i) {
              return e(
                t,
                n,
                void 0,
                i
              );
            }
          });
        },
        onUpdate(n) {
          const a = e(
            t,
            void 0,
            n
          );
          return Object.assign(a, {
            onFormUpdate(i) {
              return e(
                t,
                void 0,
                n,
                i
              );
            }
          });
        },
        onFormUpdate(n) {
          return e(
            t,
            void 0,
            void 0,
            n
          );
        }
      });
    }, c = e();
    return Object.assign(c, {
      useHook(t) {
        return s(t);
      },
      transformState(t) {
        const u = e(
          void 0,
          t
        );
        return Object.assign(u, {
          onUpdate(n) {
            const a = e(
              void 0,
              t,
              n
            );
            return Object.assign(a, {
              onFormUpdate(i) {
                return e(
                  void 0,
                  t,
                  n,
                  i
                );
              }
            });
          },
          onFormUpdate(n) {
            return e(
              void 0,
              t,
              void 0,
              n
            );
          }
        });
      },
      onUpdate(t) {
        const u = e(
          void 0,
          void 0,
          t
        );
        return Object.assign(u, {
          onFormUpdate(n) {
            return e(
              void 0,
              void 0,
              t,
              n
            );
          }
        });
      },
      onFormUpdate(t) {
        return e(
          void 0,
          void 0,
          void 0,
          t
        );
      }
    });
  }
  return { createPlugin: o };
}
const { createPlugin: d } = l();
d("analyticsPlugin").transformState(
  ({ stateKey: o, cogsState: r }, e) => {
    o === "user" && r.$update({ test: "This works!" }), o === "address" && r.$update({ city: "London", country: "UK" });
  }
);
d("fullPlugin").useHook(({ stateKey: o, cogsState: r }, e) => {
  const [s, c] = U(0);
  return {
    count: s,
    increment: () => c((t) => t + 1)
  };
}).transformState(({ stateKey: o, cogsState: r }, e, s) => {
  s && console.log(
    `[Logger] RENDER: Key '${o}' has been updated ${s.count} times.`
  );
}).onUpdate(({ stateKey: o, cogsState: r }, e, s, c) => {
  c && (console.log(`[Logger] UPDATE: Key '${o}' just changed.`), c.increment());
});
d("hookOnly").useHook((o, r) => ({ id: "test" }));
d("empty");
export {
  l as createPluginContext
};
//# sourceMappingURL=plugins.js.map
