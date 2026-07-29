import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  expect: { timeout: 10000 },
  use: {
    baseURL: "http://localhost:5173",
    browserName: "chromium",
    headless: true,
  },
  webServer: [
    {
      command: "node server.js",
      port: 5000,
      cwd: "../backend",
      timeout: 15000,
      reuseExistingServer: false,
    },
    {
      command: "npx vite",
      port: 5173,
      cwd: ".",
      timeout: 15000,
      reuseExistingServer: false,
    },
  ],
});
