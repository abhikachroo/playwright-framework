import { Page, expect } from '@playwright/test';
import { SldPage } from '@pages/SldPage';
import { Logger } from '@utils/Logger';
import { config } from '@config/index';

/**
 * SldFilterModule — orchestrates all product-filtering workflows on the SLD page.
 *
 * Rules:
 *  - Never calls page.locator() directly — only calls SldPage methods
 *  - Uses Logger for all diagnostic output
 *  - Reads URLs from config
 *  - All assertions live in test specs; this module provides assertion helpers only
 */
export class SldFilterModule {
  private logger: Logger;

  constructor(
    private page: Page,
    private sldPage: SldPage,
  ) {
    this.logger = new Logger('SldFilterModule');
  }

  // ─── Navigation ──────────────────────────────────────────────────────────────

  /**
   * Navigate to the SLD product listing page.
   * @param sldPath  Optional override; defaults to '/fr/products'
   */
  async navigateToSldPage(sldPath: string = '/fr/products'): Promise<void> {
    this.logger.info(`[${config.displayName}][${config.environment}] Navigating to SLD page: ${sldPath}`);
    await this.sldPage.navigateToSld(sldPath);
    await this.sldPage.waitForProductListLoad();
    this.logger.info(`SLD page loaded — URL: ${this.page.url()}`);
  }

  /**
   * Returns the number of product items currently displayed.
   */
  async getDisplayedProductCount(): Promise<number> {
    const count = await this.sldPage.getProductCount();
    this.logger.info(`Displayed product count: ${count}`);
    return count;
  }

  // ─── Product Type Filter ──────────────────────────────────────────────────────

  /**
   * Select one or more product type filter options by label.
   * Applies the filter (if an explicit apply button exists) and waits for the
   * product list to refresh.
   *
   * @param labels  Array of visible option labels (e.g. ['Circuit Breaker', 'Switch'])
   */
  async applyProductTypeFilter(labels: string[]): Promise<void> {
    this.logger.info(`Applying product type filter: [${labels.join(', ')}]`);

    for (const label of labels) {
      await this.sldPage.checkProductType(label);
      this.logger.debug(`Checked: ${label}`);
    }

    // Apply if a dedicated apply button exists (no-op if the filter is live)
    await this.triggerApplyIfRequired();
    await this.sldPage.waitForProductListLoad();
    this.logger.info('Product type filter applied');
  }

  /**
   * Remove (uncheck) one or more product type filter options.
   */
  async removeProductTypeFilter(labels: string[]): Promise<void> {
    this.logger.info(`Removing product type filter: [${labels.join(', ')}]`);

    for (const label of labels) {
      await this.sldPage.uncheckProductType(label);
      this.logger.debug(`Unchecked: ${label}`);
    }

    await this.triggerApplyIfRequired();
    await this.sldPage.waitForProductListLoad();
    this.logger.info('Product type filter removed');
  }

  // ─── Count Range Filter ───────────────────────────────────────────────────────

  /**
   * Apply a count (quantity) range filter.
   *
   * @param min  Minimum count (pass empty string '' to leave blank)
   * @param max  Maximum count (pass empty string '' to leave blank)
   */
  async applyCountRangeFilter(min: string, max: string): Promise<void> {
    this.logger.info(`Applying count range filter: min=${min}, max=${max}`);

    if (min !== '') {
      await this.sldPage.fillCountMin(min);
    }
    if (max !== '') {
      await this.sldPage.fillCountMax(max);
    }

    await this.triggerApplyIfRequired();
    await this.sldPage.waitForProductListLoad();
    this.logger.info('Count range filter applied');
  }

  // ─── Combined Filters ─────────────────────────────────────────────────────────

  /**
   * Apply both product type AND count range filters simultaneously.
   */
  async applyProductTypeAndCountRangeFilter(
    labels: string[],
    min: string,
    max: string,
  ): Promise<void> {
    this.logger.info(`Applying combined filters — types: [${labels.join(', ')}], range: ${min}–${max}`);

    for (const label of labels) {
      await this.sldPage.checkProductType(label);
    }
    if (min !== '') await this.sldPage.fillCountMin(min);
    if (max !== '') await this.sldPage.fillCountMax(max);

    await this.triggerApplyIfRequired();
    await this.sldPage.waitForProductListLoad();
    this.logger.info('Combined filters applied');
  }

  // ─── Reset / Clear ────────────────────────────────────────────────────────────

  /**
   * Click the global reset/clear-all button and wait for the full product list
   * to be restored.
   */
  async resetAllFilters(): Promise<void> {
    this.logger.info('Resetting all filters');
    await this.sldPage.clickResetFilters();
    await this.sldPage.waitForProductListLoad();
    this.logger.info('All filters reset');
  }

  // ─── Assertion Helpers ────────────────────────────────────────────────────────

  /**
   * Assert the SLD page is loaded by checking the URL and the product list.
   */
  async assertSldPageLoaded(): Promise<void> {
    expect(this.page.url()).toContain(new URL(config.baseUrl).hostname);
    await expect(this.sldPage.productList()).toBeVisible();
    this.logger.info('SLD page load assertion passed');
  }

  /**
   * Assert that the product count is within [min, max].
   * Pass -1 for a bound to skip it.
   */
  async assertProductCountInRange(min: number, max: number): Promise<void> {
    const count = await this.getDisplayedProductCount();
    if (min >= 0) {
      expect(count).toBeGreaterThanOrEqual(min);
    }
    if (max >= 0) {
      expect(count).toBeLessThanOrEqual(max);
    }
    this.logger.info(`Product count ${count} is within range [${min}, ${max}]`);
  }

  /**
   * Assert that the product count has changed from a baseline value,
   * meaning the filter actually had an effect.
   */
  async assertProductCountChanged(baselineCount: number): Promise<void> {
    const currentCount = await this.getDisplayedProductCount();
    expect(currentCount).not.toBe(baselineCount);
    this.logger.info(`Product count changed: ${baselineCount} → ${currentCount}`);
  }

  /**
   * Assert that the product count is greater than zero (non-empty results).
   */
  async assertProductsVisible(): Promise<void> {
    await expect(this.sldPage.productItems()).not.toHaveCount(0);
    this.logger.info('Products visible assertion passed');
  }

  /**
   * Assert that the empty-state message is shown (no products match filter).
   */
  async assertEmptyStateShown(): Promise<void> {
    await expect(this.sldPage.emptyStateMessage()).toBeVisible();
    this.logger.info('Empty state assertion passed');
  }

  /**
   * Assert the displayed product count matches the baseline (filters cleared).
   */
  async assertProductCountEquals(expected: number): Promise<void> {
    const count = await this.getDisplayedProductCount();
    expect(count).toBe(expected);
    this.logger.info(`Product count equals ${expected} — assertion passed`);
  }

  /**
   * Assert that a specific active filter chip/tag is visible.
   */
  async assertActiveFilterChipVisible(label: string): Promise<void> {
    await expect(this.sldPage.activeFilterChip(label)).toBeVisible();
    this.logger.info(`Active filter chip "${label}" is visible`);
  }

  /**
   * Assert that no active filter chips are shown (all filters cleared).
   */
  async assertNoActiveFilterChips(): Promise<void> {
    await expect(this.sldPage.activeFilterChips()).toHaveCount(0);
    this.logger.info('No active filter chips — assertion passed');
  }

  // ─── Private Helpers ─────────────────────────────────────────────────────────

  /**
   * Click the Apply button if it exists and is visible.
   * Many filter UIs are "live" (no explicit apply needed); this is a no-op in that case.
   */
  private async triggerApplyIfRequired(): Promise<void> {
    const applyBtn = this.sldPage.applyFiltersBtn();
    const isVisible = await applyBtn.isVisible().catch(() => false);
    if (isVisible) {
      await applyBtn.click();
      this.logger.debug('Apply filters button clicked');
    }
  }
}
