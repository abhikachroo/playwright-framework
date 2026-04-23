import * as fs from 'fs/promises';
import { Page, expect, Download } from '@playwright/test';
import { ExportPage } from '@pages/ExportPage';
import { Logger } from '@utils/Logger';

export class ExportModule {
  private logger: Logger;

  constructor(
    private page: Page,
    private exportPage: ExportPage,
  ) {
    this.logger = new Logger('ExportModule');
  }

  /**
   * Wait for the Export page to load.
   */
  async waitForExportPage(): Promise<void> {
    this.logger.info('Waiting for Export page to load');
    await this.exportPage.exportHeading().waitFor({ state: 'visible', timeout: 20_000 });
    this.logger.info('Export page loaded');
  }

  /**
   * Tick the SLD checkbox in the bulk-export section, then click Export.
   * Returns the Download object so the caller can assert on the file.
   */
  async triggerBulkExportWithSld(): Promise<Download> {
    this.logger.info('Triggering bulk export with SLD checkbox enabled');
    await this.exportPage.checkSldCheckbox();
    await expect(this.exportPage.sldCheckbox()).toBeChecked();

    const [download] = await Promise.all([
      this.page.waitForEvent('download', { timeout: 60_000 }),
      this.exportPage.clickBulkExport(),
    ]);

    this.logger.info(`Bulk export download started: ${download.suggestedFilename()}`);
    return download;
  }

  /**
   * Trigger category-level SLD export.
   * Returns the Download object.
   */
  async triggerCategoryExportSld(): Promise<Download> {
    this.logger.info('Triggering category SLD export');

    const [download] = await Promise.all([
      this.page.waitForEvent('download', { timeout: 60_000 }),
      this.exportPage.clickExportSldCategory(),
    ]);

    this.logger.info(`Category SLD export download started: ${download.suggestedFilename()}`);
    return download;
  }

  /**
   * Verify the SLD checkbox is checked.
   */
  async verifySldCheckboxChecked(): Promise<void> {
    this.logger.info('Verifying SLD checkbox is checked');
    await expect(this.exportPage.sldCheckbox()).toBeChecked();
  }

  /**
   * Verify an export success message is displayed.
   */
  async verifyExportSuccessMessage(): Promise<void> {
    this.logger.info('Verifying export success message');
    await expect(this.exportPage.exportSuccessMessage()).toBeVisible();
  }

  /**
   * Verify a download was received and has a non-empty filename.
   */
  async verifyDownloadReceived(download: Download): Promise<void> {
    const filename = download.suggestedFilename();
    this.logger.info(`Verifying download: ${filename}`);
    expect(filename.length, 'Downloaded file should have a non-empty filename').toBeGreaterThan(0);
  }

  /**
   * Verify the downloaded file is non-empty by checking its file size.
   */
  async verifyDownloadIsNotEmpty(download: Download): Promise<void> {
    const filePath = await download.path();
    this.logger.info(`Downloaded to temp path: ${filePath}`);
    expect(filePath, 'Download path should not be null').not.toBeNull();

    const stat = await fs.stat(filePath!);
    expect(stat.size, 'Downloaded SLD file should not be empty').toBeGreaterThan(0);
    this.logger.info(`Download file size: ${stat.size} bytes`);
  }
}
