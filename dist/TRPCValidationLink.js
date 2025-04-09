import { o as l } from "./node_modules/@trpc/server/dist/observable-ade1bad8.js";
import { getGlobalStore as p } from "./store.js";
const m = () => {
  const s = p.getState().addValidationError;
  return () => (b) => ({ next: i, op: o }) => l(
    (a) => i(o).subscribe({
      next(r) {
        a.next(r);
      },
      error(r) {
        try {
          const t = JSON.parse(r.message);
          Array.isArray(t) ? t.forEach(
            (e) => {
              const n = `${o.path}.${e.path.join(".")}`;
              s(n, e.message);
            }
          ) : typeof t == "object" && t !== null && Object.entries(t).forEach(([e, n]) => {
            const c = `${o.path}.${e}`;
            s(c, n);
          });
        } catch {
        }
        a.error(r);
      },
      complete() {
        a.complete();
      }
    })
  );
};
export {
  m as useCogsTrpcValidationLink
};
//# sourceMappingURL=TRPCValidationLink.js.map
