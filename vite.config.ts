import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { resolve } from "path";
import preserveDirectives from "rollup-preserve-directives";
export default defineConfig({
    resolve: {
        extensions: [".js", ".ts", ".jsx", ".tsx"],
    },
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            formats: ["es"],
            fileName: "index",
        },
        rollupOptions: {
            output: {
                preserveModules: true,
                preserveModulesRoot: "src",
                entryFileNames: ({ name, facadeModuleId }) => {
                    // If it's a TSX file or contains JSX, output as .jsx
                    if (
                        facadeModuleId?.endsWith(".tsx") ||
                        facadeModuleId?.includes("jsx")
                    ) {
                        return `${name.replace(/\.[^/.]+$/, "")}.jsx`;
                    }
                    return `${name.replace(/\.[^/.]+$/, "")}.js`;
                },
            },
            external: ["zod", "zod-to-json-schema", "crypto"],
            plugins: [preserveDirectives()],
        },

        sourcemap: true,
        target: "esnext",
    },
    plugins: [
        dts({
            insertTypesEntry: true,
        }),
    ],
});
