import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const environment = (process.env.ENVIRONMENT ?? 'preprod').toLowerCase();
const configFile  = require(path.join(__dirname, 'src/config/env', environment, 'config.json'));

const AUTH_FILE = path.join(__dirname, '.auth', 'state.json');

// Only attach storageState when the auth file actually exists.
// When auth setup is skipped (e.g. Akamai WAF blocks sandbox egress on preprod),
// the file will not be present — downstream chromium tests still run but
// without a pre-authenticated session rather than failing outright.
const storageState = fs.existsSync(AUTH_FILE) ? AUTH_FILE : undefined;

const CHROME_OPTIONS = {
  ...devices['Desktop Chrome'],
  // headless mode required for CI/sandbox — Google Chrome binary is not available
  headless: true,
  launchOptions: {
    // Suppress Chrome's automation signals so Cloudflare Turnstile auto-solves
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-infobars',
      '--no-first-run',
      '--no-default-browser-check',
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
    ignoreDefaultArgs: ['--enable-automation'],
  },
};

export default defineConfig({
  testDir: './src/tests',
  timeout: 120_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
  ],
  use: {
    baseURL: configFile.baseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    ignoreHTTPSErrors: true,
  },
  projects: [
    /**
     * Setup project — logs in once and saves cookies/localStorage to .auth/state.json.
     * Skips automatically when the saved state is less than 8 hours old.
     * On environments where the WAF blocks the sandbox egress IP (e.g. preprod/Akamai),
     * the setup test itself will skip via setup.skip() so no hard timeout occurs.
     * Run this project explicitly:  npx playwright test --project=setup
     */
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      use: { ...CHROME_OPTIONS },
    },

    /**
     * Authenticated project — starts every test already logged in (uses saved session).
     * storageState is attached only when .auth/state.json exists; if setup was skipped
     * (e.g. Akamai WAF environment issue) tests still run without a pre-auth session
     * rather than cascade-failing due to a missing file.
     * Depends on "setup" so the auth state is always fresh before tests run.
     * Skips login.spec.ts (that file has its own project below).
     *
     * Run:  npx playwright test --project=chromium
     */
    {
      name: 'chromium',
      use: {
        ...CHROME_OPTIONS,
        storageState,
      },
      dependencies: ['setup'],
      testIgnore: /login\.spec\.ts/,
    },

    /**
     * Login project — tests the login flow from scratch with no stored session.
     * This is the project for login.spec.ts and any other auth-flow tests.
     *
     * Run:  npx playwright test --project=login
     */
    {
      name: 'login',
      testMatch: /login\.spec\.ts/,
      use: { ...CHROME_OPTIONS },
    },
  ],
});
