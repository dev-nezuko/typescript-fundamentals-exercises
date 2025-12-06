import { defineConfig } from "vitest/config";
import { resolve } from "path";

/**
 * Vitest configuration for running tests against the solutions.
 * This config aliases the questions module to solutions, so the same
 * test file can verify that the solutions are correct.
 *
 * Usage: npm run test:solutions
 */
export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "./questions": resolve(__dirname, "src/solutions.ts"),
    },
  },
});

