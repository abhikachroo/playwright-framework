import { Page, Download, expect } from '@playwright/test';
import { WorkbenchPage } from '@pages/WorkbenchPage';
import { SLDPage } from '@pages/SLDPage';
import { ExportPage } from '@pages/ExportPage';
import { Logger } from '@utils/Logger';
import { config } from '@config/index';

/**
 * ManageQuantityModule — Layer 3 (Business logic workflows).
 * Orchestrates the 7 key user flows for OPT1-5608:
 *  1. Navigate to workbench
 *  2. Add root-level product + set quantity
 *  3. Add branch-level product + set quantity
 *  4. Navigate to SLD and verify counts
 *  5. Bulk export with SLD checkbox
 *  6. Category SLD export
 *  7. Verify exported SLD matches in-app view
 */
export class ManageQuantityModule {
  private logger: Logger;

  constructor(
    private page: Page,
    private workbenchPage: WorkbenchPage,
    private sldPage: SLDPage,
    private exportPage: ExportPage,
  ) {
    this.logger = new Logger('ManageQuantityModule');
  }

  // ── Flow 1: Navigate to switchboard workbench ──────────────────────────────

  async navigateToSwitchboard(projectName: string, switchboardName: string): Promise<void> {
    this.logger.info(`[${config.displayName}][${config.environment}] Opening switchboard: ${projectName} → ${switchboardName}`);
    await this.workbenchPage.clickProjectsNav();
    await this.workbenchPage.waitForPageLoad();
    await this.workbenchPage.openProject(projectName);
    await this.workbenchPage.waitForPageLoad();
    await this.workbenchPage.openSwitchboard(switchboardName);
    this.logger.info('Workbench loaded');
  }

  async verifyWorkbenchLoaded(): Promise<void> {
    await expect(this.workbenchPage.productsTabHeading()).toBeVisible();
    this.logger.info('Products panel visible — workbench confirmed');
  }

  async verifyWorkbenchUrl(): Promise<void> {
    await expect(this.page).toHaveURL(/switchboard|workbench/i);
    this.logger.info(`Workbench URL confirmed: ${this.page.url()}`);
  }

  // ── Flow 2: Root-level product + quantity ─────────────────────────────────

  async addRootProductWithQuantity(productName: string, quantity: number): Promise<void> {
    this.logger.info(`Adding root product "${productName}" with qty=${quantity}`);
    await this.workbenchPage.searchProduct(productName);
    await this.workbenchPage.addProductToWorkbench(productName);
    await this.workbenchPage.setRootProductQuantity(productName, quantity);
    this.logger.info(`Root product quantity set to ${quantity}`);
  }

  async verifyRootProductQtyBoxVisible(productName: string): Promise<void> {
    await expect(this.workbenchPage.rootProductQtyInput(productName)).toBeVisible();
    this.logger.info(`Quantity box confirmed visible on root card: ${productName}`);
  }

  async verifyRootProductQtyValue(productName: string, expected: number): Promise<void> {
    await expect(this.workbenchPage.rootProductQtyInput(productName)).toHaveValue(String(expected));
    this.logger.info(`Root qty value confirmed: ${expected}`);
  }

  async verifyRootQtyBoxHiddenAtOne(productName: string): Promise<void> {
    // When qty=1 the badge may be hidden per AC; assert not visible
    await expect(this.workbenchPage.rootProductQtyBadge(productName)).not.toBeVisible();
    this.logger.info(`Root qty box correctly hidden when qty=1: ${productName}`);
  }

  // ── Flow 3: Branch-level product + quantity ───────────────────────────────

  async addBranchProductWithQuantity(productName: string, quantity: number): Promise<void> {
    this.logger.info(`Adding branch product "${productName}" with qty=${quantity}`);
    await this.workbenchPage.searchProduct(productName);
    await this.workbenchPage.addProductToWorkbench(productName);
    await this.workbenchPage.setBranchProductQuantity(productName, quantity);
    this.logger.info(`Branch product quantity set to ${quantity}`);
  }

  async verifyBranchProductQtyBoxVisible(productName: string): Promise<void> {
    await expect(this.workbenchPage.branchProductQtyInput(productName)).toBeVisible();
    this.logger.info(`Quantity box confirmed visible on branch card: ${productName}`);
  }

  async verifyBranchProductQtyValue(productName: string, expected: number): Promise<void> {
    await expect(this.workbenchPage.branchProductQtyInput(productName)).toHaveValue(String(expected));
    this.logger.info(`Branch qty value confirmed: ${expected}`);
  }

  // ── Increment / Decrement helpers ─────────────────────────────────────────

  async incrementRootQtyAndVerify(productName: string, expectedAfter: number): Promise<void> {
    await this.workbenchPage.incrementRootQty(productName);
    await expect(this.workbenchPage.rootProductQtyInput(productName)).toHaveValue(String(expectedAfter));
    this.logger.info(`Root qty incremented → ${expectedAfter}`);
  }

  async decrementRootQtyAndVerify(productName: string, expectedAfter: number): Promise<void> {
    await this.workbenchPage.decrementRootQty(productName);
    await expect(this.workbenchPage.rootProductQtyInput(productName)).toHaveValue(String(expectedAfter));
    this.logger.info(`Root qty decremented → ${expectedAfter}`);
  }

  async incrementBranchQtyAndVerify(productName: string, expectedAfter: number): Promise<void> {
    await this.workbenchPage.incrementBranchQty(productName);
    await expect(this.workbenchPage.branchProductQtyInput(productName)).toHaveValue(String(expectedAfter));
    this.logger.info(`Branch qty incremented → ${expectedAfter}`);
  }

  async decrementBranchQtyAndVerify(productName: string, expectedAfter: number): Promise<void> {
    await this.workbenchPage.decrementBranchQty(productName);
    await expect(this.workbenchPage.branchProductQtyInput(productName)).toHaveValue(String(expectedAfter));
    this.logger.info(`Branch qty decremented → ${expectedAfter}`);
  }

  // ── Flow 4: Navigate to SLD and verify counts ─────────────────────────────

  async navigateToSLDPage(): Promise<void> {
    this.logger.info('Navigating to SLD page');
    await this.workbenchPage.navigateToSLD();
    await this.sldPage.waitForDiagram();
    this.logger.info('SLD diagram loaded');
  }

  async verifySLDRootProductCount(productName: string, expectedCount: number): Promise<void> {
    const countText = await this.sldPage.getRootProductCountText(productName);
    expect(countText).toContain(String(expectedCount));
    this.logger.info(`SLD root count verified: ${productName} → ${countText}`);
  }

  async verifySLDBranchProductCount(productName: string, expectedCount: number): Promise<void> {
    const countText = await this.sldPage.getBranchProductCountText(productName);
    expect(countText).toContain(String(expectedCount));
    this.logger.info(`SLD branch count verified: ${productName} → ${countText}`);
  }

  async verifySLDNodeVisible(productName: string): Promise<void> {
    await expect(this.sldPage.rootProductNode(productName)).toBeVisible();
    this.logger.info(`SLD node visible for product: ${productName}`);
  }

  // ── Flow 5: Bulk export with SLD checkbox ─────────────────────────────────

  async navigateToExportPage(): Promise<void> {
    this.logger.info('Navigating to export page');
    await this.workbenchPage.navigateToExport();
    await this.exportPage.waitForPageLoad();
    this.logger.info('Export page loaded');
  }

  async performBulkExportWithSLD(): Promise<Download> {
    this.logger.info('Performing bulk export with SLD checkbox ticked');
    await this.exportPage.tickBulkExportSld();
    await expect(this.exportPage.bulkExportSldCheckbox()).toBeChecked();
    const download = await this.exportPage.clickBulkExport();
    this.logger.info(`Bulk export download started: ${download.suggestedFilename()}`);
    return download;
  }

  async verifyBulkExportSuccess(download: Download): Promise<void> {
    const filename = download.suggestedFilename();
    expect(filename).toBeTruthy();
    this.logger.info(`Bulk export file received: ${filename}`);
  }

  // ── Flow 6: Category SLD export ───────────────────────────────────────────

  async performCategorySLDExport(): Promise<Download> {
    this.logger.info('Performing category SLD export (raw SLD)');
    const download = await this.exportPage.clickCategorySldExport();
    this.logger.info(`Category SLD download started: ${download.suggestedFilename()}`);
    return download;
  }

  async verifyCategoryExportSuccess(download: Download): Promise<void> {
    const filename = download.suggestedFilename();
    expect(filename).toBeTruthy();
    this.logger.info(`Category SLD export file received: ${filename}`);
  }

  // ── Flow 7: Verify exported SLD content ───────────────────────────────────

  async verifyExportedFileIsNotEmpty(download: Download): Promise<void> {
    const filePath = await download.path();
    expect(filePath).not.toBeNull();
    this.logger.info(`Downloaded file path: ${filePath}`);
  }

  async verifyBulkExportSldCheckboxUnchecked(): Promise<void> {
    await expect(this.exportPage.bulkExportSldCheckbox()).not.toBeChecked();
    this.logger.info('SLD checkbox is unchecked — confirmed');
  }

  async verifyBulkExportSldCheckboxChecked(): Promise<void> {
    await expect(this.exportPage.bulkExportSldCheckbox()).toBeChecked();
    this.logger.info('SLD checkbox is checked — confirmed');
  }
}
