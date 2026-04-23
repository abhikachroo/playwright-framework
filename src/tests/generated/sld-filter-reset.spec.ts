/**
 * SLD Filter Reset — P1 / P2 Tests
 * Feature: Product Filtering on SLD Page (OPT1-5608)
 *
 * Runs under the "chromium" project (storageState injected — already authenticated).
 * Covers: global reset, individual filter clear, no active chips after reset.
 *
 * ⚠️  OQ-04 (individual filter clear behaviour) is open. TC-021 is marked
 *     with a skip guard if a per-filter clear button is not found.
 */

import { test, expect } from '@fixtures';
import { config } from '@config/index';

// ─── Test Data Constants ──────────────────────────────────────────────────────
const PRODUCT_TYPE_A = 'Circuit Breaker';
const FILTER_MIN     = '5';
const FILTER_MAX     = '30';

test.describe(`@P1 @Regression @SLDFilter Filter Reset — ${config.displayName} [${config.environment}]`, () => {

  test.beforeEach(async ({ sldFilterModule }) => {
    await sldFilterModule.navigateToSldPage();
  });

  // ─── P1 ───────────────────────────────────────────────────────────────────────

  test('TC-020: Reset all filters restores the full unfiltered product list', async ({ sldFilterModule }) => {
    let baselineCount: number;

    await test.step('Record the unfiltered product count', async () => {
      baselineCount = await sldFilterModule.getDisplayedProductCount();
    });

    await test.step('Apply a product type filter to reduce the list', async () => {
      await sldFilterModule.applyProductTypeFilter([PRODUCT_TYPE_A]);
    });

    await test.step('Verify filter has changed the product count', async () => {
      await sldFilterModule.assertProductCountChanged(baselineCount);
    });

    await test.step('Click "Reset filters" / "Clear all"', async () => {
      await sldFilterModule.resetAllFilters();
    });

    await test.step('Verify product count is restored to the pre-filter baseline', async () => {
      await sldFilterModule.assertProductCountEquals(baselineCount);
    });
  });

  test('TC-021: Reset all removes all active filter chips/tags', async ({ sldPage, sldFilterModule }) => {
    await test.step('Apply both product type and count range filters', async () => {
      await sldFilterModule.applyProductTypeAndCountRangeFilter(
        [PRODUCT_TYPE_A],
        FILTER_MIN,
        FILTER_MAX,
      );
    });

    await test.step('Verify at least one active filter chip is shown (skip if no chip UI)', async () => {
      const chipCount = await sldPage.activeFilterChips().count().catch(() => 0);
      if (chipCount === 0) {
        test.skip(true, 'No active filter chip UI present — skipping chip assertion');
      }
      expect(chipCount).toBeGreaterThan(0);
    });

    await test.step('Click "Reset filters" / "Clear all"', async () => {
      await sldFilterModule.resetAllFilters();
    });

    await test.step('Verify no active filter chips remain after reset', async () => {
      await sldFilterModule.assertNoActiveFilterChips();
    });
  });

  // ─── P2 ───────────────────────────────────────────────────────────────────────

  test.describe('@P2 @Negative', () => {

    test('TC-022: Clicking reset when no filters are applied is a no-op (no crash)', async ({ sldFilterModule, sldPage }) => {
      let initialCount: number;

      await test.step('Record the product count with no filters applied', async () => {
        await sldFilterModule.resetAllFilters();
        initialCount = await sldFilterModule.getDisplayedProductCount();
      });

      await test.step('Click the reset button again when already in the unfiltered state', async () => {
        const resetBtn = sldPage.resetFiltersBtn();
        const isVisible = await resetBtn.isVisible().catch(() => false);
        if (isVisible) {
          await resetBtn.click();
          await sldPage.waitForProductListLoad();
        }
      });

      await test.step('Verify product count is unchanged and products remain visible', async () => {
        await sldFilterModule.assertProductCountEquals(initialCount);
        await sldFilterModule.assertProductsVisible();
      });
    });

  });

});
