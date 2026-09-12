import { defineConfig } from "@playwright/test";

// E2E testy skutocnej desktop appky (Electron). Pred spustenim:
//   npm run build:next && npm run build:electron
export default defineConfig({
  testDir: "e2e",
  timeout: 120_000,
  workers: 1,
  reporter: [["list"]],
});
