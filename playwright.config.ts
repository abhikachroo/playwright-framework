import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

const environment = (process.env.ENVIRONMENT ?? 'preprod').toLowerCase();
const configFile  = require(path.join(__dirname, 'src/config/env', environment, 'config.json'));

const AUTH_FILE = path.join(__dirname, '.auth', 'state.json');

/**
 * CI detection — set by most CI/CD platforms (GitHub Actions, Jenkins, CircleCI, etc.)
 * When CI=true: use Playwright-managed Chromium in headless mode (no system Chrome required).
 * When CI is unset (local dev): use system Google Chrome in headful mode so Cloudflare
 * Turnstile auto-solves correctly (headless mode is detected by CF and blocks automation).
 */
const isCI = !!process.env.CI;

const CHROME_OPTIONS = isCI
  ? {
      // ── CI / sandbox mode ──────────────────────────────────────────────────────
      // Uses Playwright-managed Chromium binary — no system Chrome required.
      // Turnstile may still challenge headless Chromium; a pre-baked .auth/state.json
      // (injected as a CI secret/artifact) is the recommended long-term solution for
      // environments that block headless browsers entirely.
      ...devices['Desktop Chrome'],
      headless: true,
      launchOptions: {
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
    }
  : {
      // ── Local dev mode ─────────────────────────────────────────────────────────
      // Requires Google Chrome installed at system path (/opt/google/chrome/chrome).
      // Headful mode is necessary so Cloudflare Turnstile auto-solves instead of
      // silently failing (CF detects headless automation and never fills the captcha).
      ...devices['Desktop Chrome'],
      channel: 'chrome',
      headless: false,
      launchOptions: {
        args: [
          '--disable-blink-features=AutomationControlled',
          '--disable-infobars',
          '--no-first-run',
          '--no-default-browser-check',
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
     * Run this project explicitly:  npx playwright test --project=setup
     */
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      use: { ...CHROME_OPTIONS },
    },

    /**
     * Authenticated project — starts every test already logged in (uses saved session).
     * Depends on 'setup' so the auth state is always fresh before tests run.
     * Skips login.spec.ts (that file has its own project below).
     *
     * Run:  npx playwright test --project=chromium
     */
    {
      name: 'chromium',
      use: {
        ...CHROME_OPTIONS,
        storageState: AUTH_FILE,
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
