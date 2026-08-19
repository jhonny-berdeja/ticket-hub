import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      // Mirrors tsconfig.json's "@/*" -> "./*" path alias; Vitest (Vite)
      // doesn't read tsconfig `paths` on its own.
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    // jsdom (not "node"): CreateTicketForm.spec.tsx/TicketDetail.spec.tsx
    // render real components via @testing-library/react (task 5.1) and
    // need a DOM. Plain *.spec.ts unit tests run fine under jsdom too.
    environment: "jsdom",
    // Required for @testing-library/react's auto-cleanup: it detects a
    // *global* `afterEach` to unmount between tests. Without this, DOM
    // from one .spec.tsx test leaks into the next.
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.spec.ts", "**/*.spec.tsx"],
    exclude: ["node_modules/**", ".next/**"],
  },
});
