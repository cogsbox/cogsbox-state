import { o as l } from "./node_modules/@trpc/server/dist/observable-ade1bad8.js";
import { getGlobalStore as p } from "./store.js";
const m = () => {
  const s = p.getState().addValidationError;
  return () => (b) => ({ next: i, op: e }) => l(
    (n) => i(e).subscribe({
      next(t) {
        n.next(t);
      },
      error(t) {
        console.log("link error1", t);
        try {
          const r = JSON.parse(t.message);
          console.log("link error2", r), Array.isArray(r) ? r.forEach(
            (o) => {
              const a = `${e.path}.${o.path.join(".")}`;
              s(
                a,
                o.message
              );
            }
          ) : typeof r == "object" && r !== null && Object.entries(r).forEach(
            ([o, a]) => {
              const c = `${e.path}.${o}`;
              s(
                c,
                a
              );
            }
          );
        } catch {
        }
        n.error(t);
      },
      complete() {
        n.complete();
      }
    })
  );
};
export {
  m as useCogsTrpcValidationLink
};
//# sourceMappingURL=TRPCValidationLink.js.map
