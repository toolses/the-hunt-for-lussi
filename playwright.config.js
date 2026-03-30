// @ts-check
const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests/e2e",
  timeout: 30000,
  expect: { timeout: 10000 },
  retries: 0,
  workers: 1, // serial — game server is shared
  reporter: "list",
  use: {
    baseURL: "http://localhost:8765",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
  webServer: {
    command: "npx http-server . -p 8765 -c-1 --silent",
    port: 8765,
    reuseExistingServer: true,
  },
});
