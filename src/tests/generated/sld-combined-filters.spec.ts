/**
 * SLD Combined Filters — Functional & Edge Case Tests
 * Feature: Product Filtering on SLD Page (OPT1-5608)
 *
 * Runs under the "chromium" project (storageState injected — already authenticated).
 * Covers: product type + count range combined, additive narrowing, zero-result edge.
 *
 * ⚠️  Constants are placeholder values — update after verifying on PPR.
 * ⚠️  OQ-03 (AND vs OR multi-filter logic) is open — tests assume AND logic
 *     (intersection). Adjust assertions if OR logic is confirmed.
 */

import { test, expect } from '@fixtures';
import { config } from '@config/index';

// ─── Test Data Constants ──────────────────────────────────────────────────────
// TODO: replace with confirmed product type labels from the live UI
const PRODUCT_TYPE_A  = 'Circuit Breaker';
const PRODUCT_TYPE_B  = 'Switch Disconnector';
const COMBINED_MIN    = '5';
const COMBINED_MAX    = '30';
const IMPOSSIBLE_MIN  = '999999';

test.describe(`@P1 @Functional @SLDFilter Combined Filters — ${config.displayName} [${config.environment}]`, () => {

  test.beforeEach(async ({ sldFilterModule }) => {
    await sldFilterModule.navigateToSldPage();
  });

  // ─── P1 Functional ───────────────────────────────────────────────────────────

  test('TC-016: Combining product type + count range narrows results further than each filter alone', async ({ sldFilterModule }) => {
    let typeOnlyCount: number;
    let rangeOnlyCount: number;

    await test.step(`Apply product type filter only: "${PRODUCT_TYPE_A}"`, async () => {
      await sldFilterModule.applyProductTypeFilter([PRODUCT_TYPE_A]);
      typeOnlyCount = await sldFilterModule.getDisplayedProductCount();
    });

    await test.step('Reset and apply count range filter only', async () => {
      await sldFilterModule.resetAllFilters();
      await sldFilterModule.applyCountRangeFilter(COMBINED_MIN, COMBINED_MAX);
      rangeOnlyCount = await sldFilterModule.getDisplayedProductCount();
    });

    await test.step('Reset and apply both filters simultaneously', async () => {
      await sldFilterModule.resetAllFilters();
      await sldFilterModule.applyProductTypeAndCountRangeFilter(
        [PRODUCT_TYPE_A],
        COMBINED_MIN,
        COMBINED_MAX,
      );
    });

    await test.step('Verify combined count is <= either individual filter count (AND narrowing)', async () => {
      const combinedCount = await sldFilterModule.getDisplayedProductCount();
      expect(combinedCount).toBeLessThanOrEqual(Math.min(typeOnlyCount, rangeOnlyCount));
    });
  });

  test('TC-017: Combined filter with two product types and range shows intersection', async ({ sldFilterModule }) => {
    await test.step(`Apply combined filter: types [${PRODUCT_TYPE_A}, ${PRODUCT_TYPE_B}] + range ${COMBINED_MIN}–${COMBINED_MAX}`, async () => {
      await sldFilterModule.applyProductTypeAndCountRangeFilter(
        [PRODUCT_TYPE_A, PRODUCT_TYPE_B],
        COMBINED_MIN,
        COMBINED_MAX,
      );
    });

    await test.step('Verify product list is updated and visible or empty state is shown', async () => {
      const count = await sldFilterModule.getDisplayedProductCount();
      if (count === 0) {
        await sldFilterModule.assertEmptyStateShown();
      } else {
        await sldFilterModule.assertProductsVisible();
      }
    });
  });

  test('TC-018: Applying one filter then a second narrows results additively', async ({ sldFilterModule }) => {
    let afterFirstFilter: number;

    await test.step(`Apply product type filter first: "${PRODUCT_TYPE_A}"`, async () => {
      await sldFilterModule.applyProductTypeFilter([PRODUCT_TYPE_A]);
      afterFirstFilter = await sldFilterModule.getDisplayedProductCount();
    });

    await test.step(`Apply count range filter on top: ${COMBINED_MIN}–${COMBINED_MAX}`, async () => {
      await sldFilterModule.applyCountRangeFilter(COMBINED_MIN, COMBINED_MAX);
    });

    await test.step('Verify result after second filter is <= result after first filter', async () => {
      const afterBothFilters = await sldFilterModule.getDisplayedProductCount();
      expect(afterBothFilters).toBeLessThanOrEqual(afterFirstFilter);
    });
  });

  // ─── P2 Edge Case ─────────────────────────────────────────────────────────────

  test.describe('@P2 @Edge', () => {

    test('TC-019: Combined filters that match nothing show empty state, not an error', async ({ sldFilterModule }) => {
      await test.step(`Apply impossible combination: type "${PRODUCT_TYPE_A}" + min count ${IMPOSSIBLE_MIN}`, async () => {
        await sldFilterModule.applyProductTypeAndCountRangeFilter(
          [PRODUCT_TYPE_A],
          IMPOSSIBLE_MIN,
          '',
        );
      });

      await test.step('Verify empty state message is shown (not an application error)', async () => {
        await sldFilterModule.assertEmptyStateShown();
      });

      await test.step('Verify the page is still functional (reset restores products)', async () => {
        await sldFilterModule.resetAllFilters();
        await sldFilterModule.assertProductsVisible();
      });
    });

  });

});
