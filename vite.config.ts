import { defineConfig } from "vite";
import { configDefaults } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    exclude: [...configDefaults.exclude],
    setupFiles: [path.resolve(__dirname, "vitest.setup.ts")],
  },
});
