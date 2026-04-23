import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ExportPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // ── Export page heading ───────────────────────────────────────────────────
  exportHeading          = () => this.page.getByRole('heading', { name: /export/i }).first();
  exportPageContainer    = () => this.page.locator('[data-testid="export-container"]').first(); // TODO: verify selector

  // ── Bulk export section ───────────────────────────────────────────────────
  bulkExportSection      = () => this.page.locator('[data-testid="bulk-export"], [class*="bulk-export"]').first(); // TODO: verify selector
  sldCheckbox            = () => this.page.getByRole('checkbox', { name: /sld/i }).first();
  sldCheckboxByTestId    = () => this.page.locator('[data-testid="export-sld-checkbox"]').first(); // TODO: verify selector
  exportAllBtn           = () => this.page.getByRole('button', { name: /export all|bulk export/i }).first(); // TODO: verify selector
  bulkExportBtn          = () => this.page.getByRole('button', { name: /export/i }).first();

  // ── Category export section ───────────────────────────────────────────────
  categoryExportSection  = () => this.page.locator('[data-testid="category-export"], [class*="category-export"]').first(); // TODO: verify selector
  sldCategoryBtn         = () => this.page.getByRole('button', { name: /export sld|sld export/i }).first(); // TODO: verify selector
  sldCategoryLink        = () => this.page.getByRole('link', { name: /sld/i }).first(); // TODO: verify selector

  // ── Export status & feedback ─────────────────────────────────────────────
  exportSuccessMessage   = () => this.page.locator('[data-testid="export-success"], [role="alert"][class*="success"], [class*="success-message"]').first(); // TODO: verify selector
  exportErrorMessage     = () => this.page.locator('[data-testid="export-error"], [role="alert"][class*="error"], [class*="error-message"]').first(); // TODO: verify selector
  downloadProgressBar    = () => this.page.locator('[data-testid="download-progress"], [role="progressbar"]').first(); // TODO: verify selector

  // ── Actions ───────────────────────────────────────────────────────────────
  async checkSldCheckbox(): Promise<void> {
    const cb = this.sldCheckbox();
    const isChecked = await cb.isChecked();
    if (!isChecked) {
      await cb.check();
    }
  }

  async uncheckSldCheckbox(): Promise<void> {
    const cb = this.sldCheckbox();
    const isChecked = await cb.isChecked();
    if (isChecked) {
      await cb.uncheck();
    }
  }

  async isSldCheckboxChecked(): Promise<boolean> {
    return this.sldCheckbox().isChecked();
  }

  async clickBulkExport(): Promise<void> {
    await this.bulkExportBtn().click();
  }

  async clickExportSldCategory(): Promise<void> {
    await this.sldCategoryBtn().click();
  }

  async getExportSuccessText(): Promise<string> {
    return (await this.exportSuccessMessage().textContent()) ?? '';
  }

  async getExportErrorText(): Promise<string> {
    return (await this.exportErrorMessage().textContent()) ?? '';
  }
}
