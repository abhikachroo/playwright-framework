import { Page, Locator, Download } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * ExportPage — Layer 2 (Locators & basic UI actions only).
 * Covers the Export page: bulk export with SLD checkbox,
 * and category-level SLD export (raw SLD).
 *
 * ALL selectors marked // TODO: verify selector were inferred because
 * the application is behind an Akamai IP whitelist and could not be
 * inspected directly.
 */
export class ExportPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // ── Page heading ───────────────────────────────────────────────────────────
  exportPageHeading = (): Locator =>
    this.page.getByRole('heading', { name: /export/i }).first(); // TODO: verify selector

  // ── Bulk export section ────────────────────────────────────────────────────
  /** "SLD" checkbox in the bulk export options list */
  bulkExportSldCheckbox = (): Locator =>
    this.page.getByRole('checkbox', { name: /sld|single line diagram/i }); // TODO: verify selector

  /** Primary "Export" / "Download" button for bulk export */
  bulkExportBtn = (): Locator =>
    this.page.getByRole('button', { name: /^export$|^download$/i }).first(); // TODO: verify selector

  /** Success toast / confirmation message after bulk export */
  bulkExportSuccessMsg = (): Locator =>
    this.page.locator('[role="alert"], [data-testid="export-success"], .export-success').first(); // TODO: verify selector

  // ── Category export section ────────────────────────────────────────────────
  /**
   * "SLD" category export button or link (raw SLD export).
   * This is distinct from the bulk export SLD checkbox.
   */
  categorySldExportBtn = (): Locator =>
    this.page.getByRole('button', { name: /export sld|sld export/i }); // TODO: verify selector

  /** Alternative: SLD item in a category list that has its own export control */
  categorySldExportItem = (): Locator =>
    this.page.getByRole('listitem').filter({ hasText: /^sld$/i })
      .getByRole('button', { name: /export|download/i }); // TODO: verify selector

  /** Success message for category SLD export */
  categoryExportSuccessMsg = (): Locator =>
    this.page.locator('[role="alert"], [data-testid="category-export-success"]').first(); // TODO: verify selector

  // ── Download helper ────────────────────────────────────────────────────────
  /** Generic download confirmation / progress indicator */
  downloadProgressIndicator = (): Locator =>
    this.page.locator('[data-testid="download-progress"], .download-progress').first(); // TODO: verify selector

  // ── Simple UI actions ──────────────────────────────────────────────────────

  async tickBulkExportSld(): Promise<void> {
    await this.bulkExportSldCheckbox().check();
  }

  async untickBulkExportSld(): Promise<void> {
    await this.bulkExportSldCheckbox().uncheck();
  }

  async isBulkExportSldChecked(): Promise<boolean> {
    return this.bulkExportSldCheckbox().isChecked();
  }

  async clickBulkExport(): Promise<Download> {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.bulkExportBtn().click(),
    ]);
    return download;
  }

  async clickCategorySldExport(): Promise<Download> {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.categorySldExportBtn().click().catch(async () => {
        // Fallback: try the category list item export button
        await this.categorySldExportItem().click();
      }),
    ]);
    return download;
  }

  async getBulkExportSuccessText(): Promise<string> {
    return (await this.bulkExportSuccessMsg().textContent()) ?? '';
  }

  async getCategoryExportSuccessText(): Promise<string> {
    return (await this.categoryExportSuccessMsg().textContent()) ?? '';
  }
}
