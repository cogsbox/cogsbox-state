import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { resolve, isAbsolute } from "path";
import preserveDirectives from "rollup-preserve-directives";

export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
    },
    rollupOptions: {
      // THIS IS THE ONLY WAY THAT WORKS.
      // It tells Vite: "If an import is not a local file, it is external."
      // This catches 'react', 'zod', '@trpc/server', EVERYTHING.
      external: (id) => !id.startsWith(".") && !isAbsolute(id),

      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: ({ name, facadeModuleId }) => {
          if (
            facadeModuleId?.endsWith(".tsx") ||
            facadeModuleId?.includes("jsx")
          ) {
            return `${name.replace(/\.[^/.]+$/, "")}.jsx`;
          }
          return `${name.replace(/\.[^/.]+$/, "")}.js`;
        },
      },
      plugins: [preserveDirectives()],
    },
    target: "esnext",
  },
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
});
