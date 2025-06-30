// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true, // so you don't have to import describe, it, expect
    // `jsdom` is not strictly required if you aren't testing browser-specific APIs
    // but it's a safe default as it emulates things like `localStorage`.
    // You could use 'node' if your library has zero browser dependencies.
    environment: "jsdom",
  },
});
