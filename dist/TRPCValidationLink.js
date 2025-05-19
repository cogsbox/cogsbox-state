import { observable as u } from "./node_modules/@trpc/server/dist/observable/observable.js";
import { getGlobalStore as f } from "./store.js";
const d = (l) => {
  const c = f.getState().addValidationError;
  return () => (b) => ({ next: s, op: n }) => u(
    (a) => s(n).subscribe({
      next(o) {
        a.next(o);
      },
      error(o) {
        try {
          const t = JSON.parse(o.message);
          l?.log && console.log("errorObject", t), Array.isArray(t) ? t.forEach(
            (r) => {
              const e = `${n.path}.${r.path.join(".")}`;
              l?.log && console.log("fullpath 1", e), c(e, r.message);
            }
          ) : typeof t == "object" && t !== null && Object.entries(t).forEach(([r, e]) => {
            const i = `${n.path}.${r}`;
            l?.log && console.log("fullpath 2", i), c(i, e);
          });
        } catch {
        }
        a.error(o);
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
