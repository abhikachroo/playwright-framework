/**
 * SLD Navigation — Smoke Tests
 * Feature: Product Filtering on SLD Page (OPT1-5608)
 *
 * Runs under the "chromium" project (storageState injected — already authenticated).
 * These P0 tests must pass on every run before functional suites execute.
 */

import { test, expect } from '@fixtures';
import { config } from '@config/index';

test.describe(`@P0 @Smoke @SLDFilter SLD Navigation — ${config.displayName} [${config.environment}]`, () => {

  test('TC-001: SLD page loads successfully and product list is visible', async ({ page, sldFilterModule }) => {
    await test.step('Navigate to the SLD product listing page', async () => {
      await sldFilterModule.navigateToSldPage();
    });

    await test.step('Verify the page URL contains the expected hostname', async () => {
      await expect(page).toHaveURL(new RegExp(new URL(config.baseUrl).hostname.replace('.', '\\.')));
    });

    await test.step('Verify at least one product is displayed on initial load', async () => {
      await sldFilterModule.assertProductsVisible();
    });
  });

  test('TC-002: Filter panel is accessible on the SLD page', async ({ page, sldPage, sldFilterModule }) => {
    await test.step('Navigate to the SLD product listing page', async () => {
      await sldFilterModule.navigateToSldPage();
    });

    await test.step('Verify the filter panel or toggle button is present', async () => {
      const panelVisible = await sldPage.filterPanel().isVisible().catch(() => false);
      const toggleVisible = await sldPage.filterToggleBtn().isVisible().catch(() => false);
      // Either the panel is open by default OR a toggle button is available
      expect(panelVisible || toggleVisible).toBe(true);
    });
  });

  test('TC-003: SLD page title is present and non-empty', async ({ page, sldPage, sldFilterModule }) => {
    await test.step('Navigate to the SLD product listing page', async () => {
      await sldFilterModule.navigateToSldPage();
    });

    await test.step('Verify the page title is non-empty', async () => {
      const title = await sldPage.getTitle();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);
    });

    await test.step('Verify the page URL is on the expected domain', async () => {
      await expect(page).toHaveURL(new RegExp(new URL(config.baseUrl).hostname.replace('.', '\\.')));
    });
  });

});
