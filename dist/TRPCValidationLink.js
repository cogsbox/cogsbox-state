import { o as d } from "./node_modules/@trpc/server/dist/observable-ade1bad8.js";
import { getGlobalStore as i } from "./store.js";
const m = () => {
  const s = i.getState().addValidationError;
  return () => (g) => ({ next: l, op: a }) => d(
    (n) => l(a).subscribe({
      next(o) {
        n.next(o);
      },
      error(o) {
        console.log("link error1", o);
        try {
          const t = JSON.parse(o.message);
          console.log("link error2", t), Array.isArray(t) ? t.forEach(
            (r) => {
              const e = `${a.path}.${r.path.join(".")}`;
              console.log(
                "Adding validation error",
                e,
                r.message
              ), console.log(
                "Current validation store before:",
                i.getState().validationErrors
              ), s(e, r.message), console.log(
                "Current validation store after:",
                i.getState().validationErrors
              );
            }
          ) : typeof t == "object" && t !== null && Object.entries(t).forEach(([r, e]) => {
            const c = `${a.path}.${r}`;
            s(c, e);
          });
        } catch {
        }
        n.error(o);
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
