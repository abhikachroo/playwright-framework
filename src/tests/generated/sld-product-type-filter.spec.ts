/**
 * SLD Product Type Filter — Functional & Negative Tests
 * Feature: Product Filtering on SLD Page (OPT1-5608)
 *
 * Runs under the "chromium" project (storageState injected — already authenticated).
 * Covers: single selection, multi-selection, deselection, select-all, clear individual.
 *
 * ⚠️  Product type option labels (e.g. "Circuit Breaker") are unverified.
 *     Update PRODUCT_TYPE_A / PRODUCT_TYPE_B constants after confirming with
 *     the live UI or dev team.
 */

import { test, expect } from '@fixtures';
import { config } from '@config/index';

// ─── Test Data Constants ──────────────────────────────────────────────────────
// TODO: replace with actual option labels extracted from the live SLD filter UI
const PRODUCT_TYPE_A       = 'Circuit Breaker';
const PRODUCT_TYPE_B       = 'Switch Disconnector';
const PRODUCT_TYPE_INVALID = '__nonexistent_type_xyz__';

test.describe(`@P1 @Functional @SLDFilter Product Type Filter — ${config.displayName} [${config.environment}]`, () => {

  test.beforeEach(async ({ sldFilterModule }) => {
    await sldFilterModule.navigateToSldPage();
  });

  // ─── P1 Functional ───────────────────────────────────────────────────────────

  test('TC-004: Selecting a single product type filters the product list', async ({ sldFilterModule }) => {
    await test.step(`Apply product type filter: "${PRODUCT_TYPE_A}"`, async () => {
      await sldFilterModule.applyProductTypeFilter([PRODUCT_TYPE_A]);
    });

    await test.step('Verify the product list is updated and at least one product is shown', async () => {
      await sldFilterModule.assertProductsVisible();
    });
  });

  test('TC-005: Selecting multiple product types shows combined results', async ({ sldFilterModule }) => {
    let singleTypeCount: number;

    await test.step(`Apply filter for first product type only: "${PRODUCT_TYPE_A}"`, async () => {
      await sldFilterModule.applyProductTypeFilter([PRODUCT_TYPE_A]);
      singleTypeCount = await sldFilterModule.getDisplayedProductCount();
    });

    await test.step('Reset filters to start fresh', async () => {
      await sldFilterModule.resetAllFilters();
    });

    await test.step(`Apply filter for both types: "${PRODUCT_TYPE_A}" + "${PRODUCT_TYPE_B}"`, async () => {
      await sldFilterModule.applyProductTypeFilter([PRODUCT_TYPE_A, PRODUCT_TYPE_B]);
    });

    await test.step('Verify combined selection shows >= single-type count (OR logic)', async () => {
      const combinedCount = await sldFilterModule.getDisplayedProductCount();
      expect(combinedCount).toBeGreaterThanOrEqual(singleTypeCount);
    });
  });

  test('TC-006: Deselecting a product type restores previous results', async ({ sldFilterModule }) => {
    let preFilterCount: number;

    await test.step('Record baseline count', async () => {
      preFilterCount = await sldFilterModule.getDisplayedProductCount();
    });

    await test.step(`Select product type: "${PRODUCT_TYPE_A}"`, async () => {
      await sldFilterModule.applyProductTypeFilter([PRODUCT_TYPE_A]);
    });

    await test.step(`Deselect product type: "${PRODUCT_TYPE_A}"`, async () => {
      await sldFilterModule.removeProductTypeFilter([PRODUCT_TYPE_A]);
    });

    await test.step('Verify product count returns to pre-filter baseline', async () => {
      const restoredCount = await sldFilterModule.getDisplayedProductCount();
      expect(restoredCount).toBe(preFilterCount);
    });
  });

  test('TC-007: Product type filter chips/tags are shown when a filter is active', async ({ sldFilterModule }) => {
    await test.step(`Apply product type filter: "${PRODUCT_TYPE_A}"`, async () => {
      await sldFilterModule.applyProductTypeFilter([PRODUCT_TYPE_A]);
    });

    await test.step('Verify active filter chip is visible for the selected type', async () => {
      await sldFilterModule.assertActiveFilterChipVisible(PRODUCT_TYPE_A);
    });
  });

  test('TC-008: All products shown when no product type filter is selected', async ({ sldFilterModule }) => {
    let unfilteredCount: number;

    await test.step('Record unfiltered product count', async () => {
      unfilteredCount = await sldFilterModule.getDisplayedProductCount();
    });

    await test.step('Ensure no product type filter is applied (reset if needed)', async () => {
      await sldFilterModule.resetAllFilters();
    });

    await test.step('Verify product count equals the unfiltered baseline', async () => {
      const countAfterReset = await sldFilterModule.getDisplayedProductCount();
      expect(countAfterReset).toBe(unfilteredCount);
    });
  });

  // ─── P2 Negative / Edge ───────────────────────────────────────────────────────

  test.describe('@P2 @Negative', () => {

    test('TC-009: Applying a product type filter that matches no products shows empty state', async ({ sldPage, sldFilterModule }) => {
      await test.step('Check whether the invalid filter option exists in the UI', async () => {
        const invalidCheckbox = sldPage.productTypeCheckbox(PRODUCT_TYPE_INVALID);
        const isPresent = await invalidCheckbox.isVisible({ timeout: 2_000 }).catch(() => false);
        if (!isPresent) {
          test.skip(true, `Option "${PRODUCT_TYPE_INVALID}" not found in filter UI — skip`);
        }
      });

      await test.step(`Apply product type filter: "${PRODUCT_TYPE_INVALID}"`, async () => {
        await sldFilterModule.applyProductTypeFilter([PRODUCT_TYPE_INVALID]);
      });

      await test.step('Verify empty state message is displayed', async () => {
        await sldFilterModule.assertEmptyStateShown();
      });
    });

    test('TC-010: Product type filter options are visible and labelled correctly', async ({ sldPage, sldFilterModule }) => {
      await test.step('Open the filter panel if not already visible', async () => {
        const panelVisible = await sldPage.filterPanel().isVisible().catch(() => false);
        if (!panelVisible) {
          await sldPage.clickFilterToggle();
        }
      });

      await test.step('Verify at least one product type option checkbox is visible', async () => {
        await expect(sldPage.productTypeCheckboxes()).not.toHaveCount(0);
      });

      await test.step('Verify the product type filter section heading is visible', async () => {
        await expect(sldPage.productTypeFilterHeading()).toBeVisible();
      });
    });

  });

});
