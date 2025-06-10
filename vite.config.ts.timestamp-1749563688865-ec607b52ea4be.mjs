// vite.config.ts
import { defineConfig } from "file:///E:/Web%20Dev/gootNode/cogsbox-state/node_modules/vite/dist/node/index.js";
import dts from "file:///E:/Web%20Dev/gootNode/cogsbox-state/node_modules/vite-plugin-dts/dist/index.mjs";
import { resolve, isAbsolute } from "path";
import preserveDirectives from "file:///E:/Web%20Dev/gootNode/cogsbox-state/node_modules/rollup-preserve-directives/dist/es/index.mjs";
var __vite_injected_original_dirname = "E:\\Web Dev\\gootNode\\cogsbox-state";
var vite_config_default = defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: resolve(__vite_injected_original_dirname, "src/index.ts"),
      formats: ["es"]
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
          if (facadeModuleId?.endsWith(".tsx") || facadeModuleId?.includes("jsx")) {
            return `${name.replace(/\.[^/.]+$/, "")}.jsx`;
          }
          return `${name.replace(/\.[^/.]+$/, "")}.js`;
        }
      },
      plugins: [preserveDirectives()]
    },
    target: "esnext"
  },
  plugins: [
    dts({
      insertTypesEntry: true
    })
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxXZWIgRGV2XFxcXGdvb3ROb2RlXFxcXGNvZ3Nib3gtc3RhdGVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkU6XFxcXFdlYiBEZXZcXFxcZ29vdE5vZGVcXFxcY29nc2JveC1zdGF0ZVxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRTovV2ViJTIwRGV2L2dvb3ROb2RlL2NvZ3Nib3gtc3RhdGUvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xyXG5pbXBvcnQgZHRzIGZyb20gXCJ2aXRlLXBsdWdpbi1kdHNcIjtcclxuaW1wb3J0IHsgcmVzb2x2ZSwgaXNBYnNvbHV0ZSB9IGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCBwcmVzZXJ2ZURpcmVjdGl2ZXMgZnJvbSBcInJvbGx1cC1wcmVzZXJ2ZS1kaXJlY3RpdmVzXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIGJ1aWxkOiB7XHJcbiAgICBzb3VyY2VtYXA6IHRydWUsXHJcbiAgICBsaWI6IHtcclxuICAgICAgZW50cnk6IHJlc29sdmUoX19kaXJuYW1lLCBcInNyYy9pbmRleC50c1wiKSxcclxuICAgICAgZm9ybWF0czogW1wiZXNcIl0sXHJcbiAgICB9LFxyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICAvLyBUSElTIElTIFRIRSBPTkxZIFdBWSBUSEFUIFdPUktTLlxyXG4gICAgICAvLyBJdCB0ZWxscyBWaXRlOiBcIklmIGFuIGltcG9ydCBpcyBub3QgYSBsb2NhbCBmaWxlLCBpdCBpcyBleHRlcm5hbC5cIlxyXG4gICAgICAvLyBUaGlzIGNhdGNoZXMgJ3JlYWN0JywgJ3pvZCcsICdAdHJwYy9zZXJ2ZXInLCBFVkVSWVRISU5HLlxyXG4gICAgICBleHRlcm5hbDogKGlkKSA9PiAhaWQuc3RhcnRzV2l0aChcIi5cIikgJiYgIWlzQWJzb2x1dGUoaWQpLFxyXG5cclxuICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgcHJlc2VydmVNb2R1bGVzOiB0cnVlLFxyXG4gICAgICAgIHByZXNlcnZlTW9kdWxlc1Jvb3Q6IFwic3JjXCIsXHJcbiAgICAgICAgZW50cnlGaWxlTmFtZXM6ICh7IG5hbWUsIGZhY2FkZU1vZHVsZUlkIH0pID0+IHtcclxuICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgZmFjYWRlTW9kdWxlSWQ/LmVuZHNXaXRoKFwiLnRzeFwiKSB8fFxyXG4gICAgICAgICAgICBmYWNhZGVNb2R1bGVJZD8uaW5jbHVkZXMoXCJqc3hcIilcclxuICAgICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm4gYCR7bmFtZS5yZXBsYWNlKC9cXC5bXi8uXSskLywgXCJcIil9LmpzeGA7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gYCR7bmFtZS5yZXBsYWNlKC9cXC5bXi8uXSskLywgXCJcIil9LmpzYDtcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgICBwbHVnaW5zOiBbcHJlc2VydmVEaXJlY3RpdmVzKCldLFxyXG4gICAgfSxcclxuICAgIHRhcmdldDogXCJlc25leHRcIixcclxuICB9LFxyXG4gIHBsdWdpbnM6IFtcclxuICAgIGR0cyh7XHJcbiAgICAgIGluc2VydFR5cGVzRW50cnk6IHRydWUsXHJcbiAgICB9KSxcclxuICBdLFxyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUErUixTQUFTLG9CQUFvQjtBQUM1VCxPQUFPLFNBQVM7QUFDaEIsU0FBUyxTQUFTLGtCQUFrQjtBQUNwQyxPQUFPLHdCQUF3QjtBQUgvQixJQUFNLG1DQUFtQztBQUt6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixPQUFPO0FBQUEsSUFDTCxXQUFXO0FBQUEsSUFDWCxLQUFLO0FBQUEsTUFDSCxPQUFPLFFBQVEsa0NBQVcsY0FBYztBQUFBLE1BQ3hDLFNBQVMsQ0FBQyxJQUFJO0FBQUEsSUFDaEI7QUFBQSxJQUNBLGVBQWU7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUliLFVBQVUsQ0FBQyxPQUFPLENBQUMsR0FBRyxXQUFXLEdBQUcsS0FBSyxDQUFDLFdBQVcsRUFBRTtBQUFBLE1BRXZELFFBQVE7QUFBQSxRQUNOLGlCQUFpQjtBQUFBLFFBQ2pCLHFCQUFxQjtBQUFBLFFBQ3JCLGdCQUFnQixDQUFDLEVBQUUsTUFBTSxlQUFlLE1BQU07QUFDNUMsY0FDRSxnQkFBZ0IsU0FBUyxNQUFNLEtBQy9CLGdCQUFnQixTQUFTLEtBQUssR0FDOUI7QUFDQSxtQkFBTyxHQUFHLEtBQUssUUFBUSxhQUFhLEVBQUUsQ0FBQztBQUFBLFVBQ3pDO0FBQ0EsaUJBQU8sR0FBRyxLQUFLLFFBQVEsYUFBYSxFQUFFLENBQUM7QUFBQSxRQUN6QztBQUFBLE1BQ0Y7QUFBQSxNQUNBLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQztBQUFBLElBQ2hDO0FBQUEsSUFDQSxRQUFRO0FBQUEsRUFDVjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsSUFBSTtBQUFBLE1BQ0Ysa0JBQWtCO0FBQUEsSUFDcEIsQ0FBQztBQUFBLEVBQ0g7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
