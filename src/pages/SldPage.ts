import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * SldPage — Single-Line Diagram / product listing page.
 *
 * All locators are arrow functions returning a Locator.
 * Zero business logic — simple UI actions only.
 *
 * ⚠️  Locators marked "// TODO: verify selector" were derived from
 *     semantic best-practice patterns; live CDN access was blocked
 *     during test planning. Verify against the running PPR environment
 *     before executing tests.
 */
export class SldPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // ─── Navigation ────────────────────────────────────────────────────────────

  /** SLD / product listing page heading */
  pageHeading = (): Locator =>
    this.page.getByRole('heading', { level: 1 }); // TODO: verify selector — confirm h1 text

  /** Breadcrumb trail (used to confirm SLD page context) */
  breadcrumb = (): Locator =>
    this.page.locator('[aria-label="breadcrumb"], nav[class*="breadcrumb"]').first(); // TODO: verify selector

  // ─── Filter Panel ───────────────────────────────────────────────────────────

  /** Top-level filter panel / sidebar container */
  filterPanel = (): Locator =>
    this.page.locator('[data-testid="filter-panel"], [class*="filter-panel"], aside[class*="filter"]').first(); // TODO: verify selector

  /** Filter panel toggle button (opens/closes the filter sidebar) */
  filterToggleBtn = (): Locator =>
    this.page.getByRole('button', { name: /filter|filters/i }).first(); // TODO: verify selector

  // ─── Product Type Filter ────────────────────────────────────────────────────

  /** Product type filter section label / heading */
  productTypeFilterHeading = (): Locator =>
    this.page.getByText(/product type|type de produit/i).first(); // TODO: verify selector

  /** All product type filter checkboxes */
  productTypeCheckboxes = (): Locator =>
    this.page.locator('[data-testid*="product-type"] input[type="checkbox"], [class*="product-type"] input[type="checkbox"]'); // TODO: verify selector

  /**
   * A single product-type checkbox by label text.
   * @param label  The visible label text of the option (e.g. "Circuit Breaker")
   */
  productTypeCheckbox = (label: string): Locator =>
    this.page.getByRole('checkbox', { name: new RegExp(label, 'i') }); // role-based — preferred

  /** "Select All" product type checkbox or button */
  productTypeSelectAll = (): Locator =>
    this.page.getByRole('checkbox', { name: /select all/i })
      .or(this.page.getByRole('button', { name: /select all/i }))
      .first(); // TODO: verify selector

  /** Count/badge showing how many product types are selected */
  productTypeSelectedCount = (): Locator =>
    this.page.locator('[data-testid="product-type-count"], [class*="selected-count"]').first(); // TODO: verify selector

  // ─── Count / Quantity Range Filter ─────────────────────────────────────────

  /** Count range filter section label / heading */
  countRangeFilterHeading = (): Locator =>
    this.page.getByText(/count|quantity|number of products/i).first(); // TODO: verify selector

  /** Minimum count input field */
  countMinInput = (): Locator =>
    this.page.getByRole('spinbutton', { name: /min/i })
      .or(this.page.locator('input[name*="min"], input[placeholder*="min"]'))
      .first(); // TODO: verify selector

  /** Maximum count input field */
  countMaxInput = (): Locator =>
    this.page.getByRole('spinbutton', { name: /max/i })
      .or(this.page.locator('input[name*="max"], input[placeholder*="max"]'))
      .first(); // TODO: verify selector

  /** Range slider track (used for drag-based range selection) */
  countRangeSlider = (): Locator =>
    this.page.locator('[role="slider"], input[type="range"]').first(); // TODO: verify selector

  // ─── Apply / Reset Controls ─────────────────────────────────────────────────

  /** "Apply filters" / "Search" / "Apply" button */
  applyFiltersBtn = (): Locator =>
    this.page.getByRole('button', { name: /apply|search|filter/i }).first(); // TODO: verify selector

  /** "Reset filters" / "Clear all" / "Clear" button */
  resetFiltersBtn = (): Locator =>
    this.page.getByRole('button', { name: /reset|clear all|clear filters/i })
      .or(this.page.getByText(/reset|clear all/i))
      .first(); // TODO: verify selector

  /** "Clear" button for an individual filter (e.g. just product type) */
  clearProductTypeFilterBtn = (): Locator =>
    this.page.locator('[data-testid="clear-product-type"], [aria-label*="clear product type"]').first(); // TODO: verify selector

  // ─── Product List ────────────────────────────────────────────────────────────

  /** Container holding the product cards / list items */
  productList = (): Locator =>
    this.page.locator('[data-testid="product-list"], [class*="product-list"], ul[class*="product"]').first(); // TODO: verify selector

  /** All individual product items in the list */
  productItems = (): Locator =>
    this.page.locator('[data-testid="product-item"], [class*="product-card"], [class*="product-item"]'); // TODO: verify selector

  /** Product count / total label (e.g. "24 products") */
  productCountLabel = (): Locator =>
    this.page.locator('[data-testid="product-count"], [class*="product-count"], [class*="results-count"]').first(); // TODO: verify selector

  /** Empty state message (shown when no products match filters) */
  emptyStateMessage = (): Locator =>
    this.page.locator('[data-testid="empty-state"], [class*="empty-state"], [class*="no-results"]').first(); // TODO: verify selector

  /** Loading spinner / skeleton (shown while filter results load) */
  loadingSpinner = (): Locator =>
    this.page.locator('[role="progressbar"], [class*="spinner"], [class*="skeleton"]').first(); // TODO: verify selector

  // ─── Active Filter Tags / Chips ──────────────────────────────────────────────

  /** Container for active filter chips/tags */
  activeFilterChips = (): Locator =>
    this.page.locator('[data-testid="active-filters"], [class*="active-filter"], [class*="filter-chip"]'); // TODO: verify selector

  /** A single active filter chip by its label */
  activeFilterChip = (label: string): Locator =>
    this.page.locator(`[data-testid="active-filters"] [aria-label*="${label}"], [class*="filter-chip"]:has-text("${label}")`); // TODO: verify selector

  // ─── Simple UI Actions ────────────────────────────────────────────────────────

  async navigateToSld(sldPath: string = '/fr/products'): Promise<void> {
    await this.page.goto(sldPath);
    await this.waitForPageLoad();
  }

  async clickFilterToggle(): Promise<void> {
    await this.filterToggleBtn().click();
  }

  async checkProductType(label: string): Promise<void> {
    await this.productTypeCheckbox(label).check();
  }

  async uncheckProductType(label: string): Promise<void> {
    await this.productTypeCheckbox(label).uncheck();
  }

  async fillCountMin(value: string): Promise<void> {
    await this.countMinInput().clear();
    await this.countMinInput().fill(value);
  }

  async fillCountMax(value: string): Promise<void> {
    await this.countMaxInput().clear();
    await this.countMaxInput().fill(value);
  }

  async clickApplyFilters(): Promise<void> {
    await this.applyFiltersBtn().click();
  }

  async clickResetFilters(): Promise<void> {
    await this.resetFiltersBtn().click();
  }

  async waitForProductListLoad(): Promise<void> {
    // Wait for any loading indicators to disappear
    await this.loadingSpinner()
      .waitFor({ state: 'hidden', timeout: 15_000 })
      .catch(() => undefined); // spinner may not be present
    await this.waitForPageLoad();
  }

  async getProductCount(): Promise<number> {
    const items = this.productItems();
    return items.count();
  }

  async getProductCountLabelText(): Promise<string> {
    return (await this.productCountLabel().textContent()) ?? '';
  }

  async getEmptyStateText(): Promise<string> {
    return (await this.emptyStateMessage().textContent()) ?? '';
  }

  async getActiveFilterChipLabels(): Promise<string[]> {
    const chips = this.activeFilterChips();
    const count = await chips.count();
    const labels: string[] = [];
    for (let i = 0; i < count; i++) {
      labels.push((await chips.nth(i).textContent()) ?? '');
    }
    return labels;
  }

  async isFilterPanelVisible(): Promise<boolean> {
    return this.filterPanel().isVisible();
  }
}
