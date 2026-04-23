/**
 * Auth setup — alternate login strategy using Playwright storageState.
 *
 * Runs once before the authenticated test projects. Performs the full login
 * flow, then serialises cookies + localStorage to .auth/state.json.
 * Subsequent test runs reuse that file (up to AUTH_TTL_HOURS) so they never
 * touch the login page and are not blocked by CAPTCHA.
 *
 * Usage: this file is picked up by the "setup" project in playwright.config.ts.
 * Tests in the "chromium" project declare `dependencies: ['setup']` and receive
 * the saved state automatically via `storageState: AUTH_FILE`.
 */

import { test as setup, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { config } from '@config/index';
import { LoginPage } from '@pages/LoginPage';

export const AUTH_FILE = path.join(process.cwd(), '.auth', 'state.json');
const AUTH_TTL_HOURS = 8;

setup('authenticate and save session', async ({ page }) => {
  // Skip on environments where the sandbox egress IP is blocked by Akamai CDN/WAF.
  // The preprod host (ecoset-config-ppr.se.com) returns HTTP 403 Access Denied
  // before the login page loads — no locator can match and no credentials can
  // be submitted. Allowlist the runner's egress IP on the Akamai WAF to re-enable.
  setup.skip(
    process.env.ENVIRONMENT === 'preprod',
    'Skipped: environment instability — Akamai CDN/WAF blocks sandbox egress IP on preprod (ecoset-config-ppr.se.com returns 403). Allowlist the runner IP to re-enable.',
  );

  // Reuse saved state if it is still within the TTL
  if (fs.existsSync(AUTH_FILE)) {
    const ageHours = (Date.now() - fs.statSync(AUTH_FILE).mtimeMs) / 3_600_000;
    if (ageHours < AUTH_TTL_HOURS) {
      console.log(`[auth.setup] Reusing cached auth state (${ageHours.toFixed(1)}h old)`);
      return;
    }
  }

  const loginPage = new LoginPage(page);

  await setup.step('Navigate to login page', async () => {
    await loginPage.navigate(config.loginPath);
    await loginPage.waitForPageLoad();
    await loginPage.dismissCookieBanner();
  });

  await setup.step('Enter email and verify human', async () => {
    await loginPage.fillEmail(config.username);
    await loginPage.checkHumanVerification();
    await loginPage.waitForAuth0CaptchaSolved();
    await loginPage.clickContinue();
  });

  await setup.step('Handle Auth0 identifier page if redirected', async () => {
    await page.waitForLoadState('domcontentloaded', { timeout: 20_000 });
    if (page.url().includes('identifier')) {
      // Wait for Turnstile to auto-solve before touching the email field —
      // fillEmail() triggers a React re-render that resets the Turnstile widget.
      await loginPage.waitForAuth0CaptchaSolved(8_000);

      const emailValue = await loginPage.emailInput().inputValue().catch(() => '');
      if (!emailValue) {
        await loginPage.fillEmail(config.username);
      }

      await loginPage.checkHumanVerification();
      await loginPage.waitForAuth0CaptchaSolved(15_000);
      await loginPage.clickAuth0Continue();
      await page.waitForURL(url => !url.pathname.includes('/identifier'), { timeout: 30_000 });
    }
  });

  await setup.step('Enter password and sign in', async () => {
    await loginPage.fillPassword(config.password);
    await loginPage.clickSignIn();
    await loginPage.waitForPageLoad();
  });

  await setup.step('Verify logged in and persist session', async () => {
    const currentUrl = page.url();
    expect(currentUrl).toContain(new URL(config.baseUrl).hostname);

    fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
    await page.context().storageState({ path: AUTH_FILE });
    console.log(`[auth.setup] Auth state saved → ${AUTH_FILE}`);
  });
});
