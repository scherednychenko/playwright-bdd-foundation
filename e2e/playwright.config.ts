import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import { resolve } from 'node:path';
import dotenv from 'dotenv';

dotenv.config();

const DEMO_PORT = 3000;
const externalBaseURL = process.env.BASE_URL;
const baseURL = externalBaseURL || `http://localhost:${DEMO_PORT}`;
const tags = process.env.E2E_TAGS || '@smoke';

// Cross-browser is opt-in so local feedback stays fast and `pnpm install` only
// needs Chromium. Set E2E_ALL_BROWSERS=1 (CI does this on main) for the full matrix.
const allBrowsers = process.env.E2E_ALL_BROWSERS === '1';

// Pin artifact locations to this config's directory so they land in e2e/ no
// matter the working directory — keeps them in sync with the CI upload paths.
const reportDir = resolve(__dirname, 'playwright-report');
const resultsDir = resolve(__dirname, 'test-results');

const testDir = defineBddConfig({
  outputDir: '.features-gen/navigation',
  features: ['features/**/*.feature'],
  steps: ['steps/**/*.ts', 'fixtures/**/*.ts'],
  tags,
});

export default defineConfig({
  testDir,
  outputDir: resultsDir,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never', outputFolder: reportDir }]]
    : [['list'], ['html', { open: 'never', outputFolder: reportDir }]],
  // Boot the bundled demo app unless an external target is supplied via BASE_URL.
  // This keeps the suite self-contained: clone, install, and `pnpm run e2e:test` is green.
  webServer: externalBaseURL
    ? undefined
    : {
        command: `node ../demo/server.mjs`,
        url: `http://localhost:${DEMO_PORT}`,
        env: { PORT: String(DEMO_PORT) },
        reuseExistingServer: !process.env.CI,
        timeout: 30_000,
      },
  use: {
    baseURL,
    headless: process.env.E2E_HEADLESS !== 'false',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    ...(allBrowsers
      ? [
          {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
          },
          {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
          },
        ]
      : []),
  ],
});
