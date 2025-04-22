import { o as u } from "./node_modules/@trpc/server/dist/observable-ade1bad8.js";
import { getGlobalStore as f } from "./store.js";
const d = (l) => {
  const c = f.getState().addValidationError;
  return () => (b) => ({ next: s, op: n }) => u(
    (a) => s(n).subscribe({
      next(t) {
        a.next(t);
      },
      error(t) {
        try {
          const o = JSON.parse(t.message);
          l?.log && console.log("errorObject", o), Array.isArray(o) ? o.forEach(
            (r) => {
              const e = `${n.path}.${r.path.join(".")}`;
              l?.log && console.log("fullpath 1", e), c(e, r.message);
            }
          ) : typeof o == "object" && o !== null && Object.entries(o).forEach(([r, e]) => {
            const i = `${n.path}.${r}`;
            l?.log && console.log("fullpath 2", i), c(i, e);
          });
        } catch {
        }
        a.error(t);
      },
      complete() {
        a.complete();
      }
    })
  );
};
export {
  d as useCogsTrpcValidationLink
};
//# sourceMappingURL=TRPCValidationLink.js.map
