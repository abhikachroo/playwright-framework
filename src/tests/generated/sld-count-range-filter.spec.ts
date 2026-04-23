/**
 * SLD Count Range Filter — Functional & Negative Tests
 * Feature: Product Filtering on SLD Page (OPT1-5608)
 *
 * Runs under the "chromium" project (storageState injected — already authenticated).
 * Covers: min-only filter, max-only filter, min+max range, boundary values, invalid input.
 *
 * ⚠️  MIN_VALUE / MAX_VALUE / BOUNDARY_MAX constants are placeholder estimates.
 *     Update these with real values from the PPR environment before running.
 */

import { test, expect } from '@fixtures';
import { config } from '@config/index';
import { DataGenerator } from '@utils/DataGenerator';

// ─── Test Data Constants ──────────────────────────────────────────────────────
// TODO: update these with values observed from the live SLD filter UI on PPR
const FILTER_MIN_VALUE = '5';
const FILTER_MAX_VALUE = '50';
const FILTER_MIN_ONLY  = '10';
const FILTER_MAX_ONLY  = '20';
const BOUNDARY_MIN     = '1';
const BOUNDARY_MAX     = '9999';

test.describe(`@P1 @Functional @SLDFilter Count Range Filter — ${config.displayName} [${config.environment}]`, () => {

  test.beforeEach(async ({ sldFilterModule }) => {
    await sldFilterModule.navigateToSldPage();
  });

  // ─── P1 Functional ───────────────────────────────────────────────────────────

  test('TC-011: Applying a minimum count filter updates the product list', async ({ sldFilterModule }) => {
    let baselineCount: number;

    await test.step('Record unfiltered product count', async () => {
      baselineCount = await sldFilterModule.getDisplayedProductCount();
    });

    await test.step(`Apply minimum count filter: ${FILTER_MIN_ONLY}`, async () => {
      await sldFilterModule.applyCountRangeFilter(FILTER_MIN_ONLY, '');
    });

    await test.step('Verify the product list reflects the min filter', async () => {
      const filteredCount = await sldFilterModule.getDisplayedProductCount();
      expect(filteredCount).toBeLessThanOrEqual(baselineCount);
    });
  });

  test('TC-012: Applying a maximum count filter updates the product list', async ({ sldFilterModule }) => {
    let baselineCount: number;

    await test.step('Record unfiltered product count', async () => {
      baselineCount = await sldFilterModule.getDisplayedProductCount();
    });

    await test.step(`Apply maximum count filter: ${FILTER_MAX_ONLY}`, async () => {
      await sldFilterModule.applyCountRangeFilter('', FILTER_MAX_ONLY);
    });

    await test.step('Verify the product list reflects the max filter', async () => {
      const filteredCount = await sldFilterModule.getDisplayedProductCount();
      expect(filteredCount).toBeLessThanOrEqual(baselineCount);
    });
  });

  test('TC-013: Applying both min and max count filters narrows the product list', async ({ sldFilterModule }) => {
    let minOnlyCount: number;

    await test.step(`Apply min-only filter: ${FILTER_MIN_VALUE}`, async () => {
      await sldFilterModule.applyCountRangeFilter(FILTER_MIN_VALUE, '');
      minOnlyCount = await sldFilterModule.getDisplayedProductCount();
    });

    await test.step('Reset filters', async () => {
      await sldFilterModule.resetAllFilters();
    });

    await test.step(`Apply min + max range filter: ${FILTER_MIN_VALUE}–${FILTER_MAX_VALUE}`, async () => {
      await sldFilterModule.applyCountRangeFilter(FILTER_MIN_VALUE, FILTER_MAX_VALUE);
    });

    await test.step('Verify min+max range result is <= min-only result', async () => {
      const rangeCount = await sldFilterModule.getDisplayedProductCount();
      expect(rangeCount).toBeLessThanOrEqual(minOnlyCount);
    });
  });

  test('TC-014: Boundary values (min=1, max=9999) show all products', async ({ sldFilterModule }) => {
    let baselineCount: number;

    await test.step('Record unfiltered product count', async () => {
      baselineCount = await sldFilterModule.getDisplayedProductCount();
    });

    await test.step(`Apply boundary count range: ${BOUNDARY_MIN}–${BOUNDARY_MAX}`, async () => {
      await sldFilterModule.applyCountRangeFilter(BOUNDARY_MIN, BOUNDARY_MAX);
    });

    await test.step('Verify product count equals the unfiltered baseline', async () => {
      const boundaryCount = await sldFilterModule.getDisplayedProductCount();
      expect(boundaryCount).toBe(baselineCount);
    });
  });

  // ─── P2 Negative ─────────────────────────────────────────────────────────────

  test.describe('@P2 @Negative', () => {

    test('TC-015: Entering an invalid (non-numeric) count value does not break the page', async ({ page, sldPage, sldFilterModule }) => {
      const invalidInput = DataGenerator.randomString(4); // random non-numeric letters

      await test.step(`Enter non-numeric value in the min count field`, async () => {
        await sldPage.fillCountMin(invalidInput);
        // Press Tab to trigger blur/validation
        await page.keyboard.press('Tab');
      });

      await test.step('Wait for any filter response to settle', async () => {
        await sldPage.waitForProductListLoad();
      });

      await test.step('Verify the page still shows products or a validation message — no crash', async () => {
        const productsVisible = await sldPage.productItems().count().catch(() => 0);
        const emptyVisible = await sldPage.emptyStateMessage().isVisible().catch(() => false);
        expect(productsVisible > 0 || emptyVisible).toBe(true);
      });

      await test.step('Verify page URL is still on the expected domain', async () => {
        await expect(page).toHaveURL(new RegExp(new URL(config.baseUrl).hostname.replace('.', '\\.')));
      });
    });

  });

});
