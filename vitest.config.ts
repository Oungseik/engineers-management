import * as Path from "node:path";
import process from "node:process";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    alias: {
      "@": Path.join(process.cwd(), "src"),
    },
  },
});
