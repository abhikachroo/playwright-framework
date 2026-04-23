import { Page, expect } from '@playwright/test';
import { SLDPage } from '@pages/SLDPage';
import { Logger } from '@utils/Logger';

export class SLDModule {
  private logger: Logger;

  constructor(
    private page: Page,
    private sldPage: SLDPage,
  ) {
    this.logger = new Logger('SLDModule');
  }

  /**
   * Wait for the SLD canvas to be fully rendered.
   */
  async waitForSLDLoad(): Promise<void> {
    this.logger.info('Waiting for SLD canvas to load');
    await this.sldPage.sldCanvas().waitFor({ state: 'visible', timeout: 30_000 });
    this.logger.info('SLD canvas loaded');
  }

  /**
   * Verify the root-level node count matches the expected number.
   */
  async verifyRootNodeCount(expectedCount: number): Promise<void> {
    this.logger.info(`Verifying root node count: expected ${expectedCount}`);
    await expect(this.sldPage.rootLevelNodes()).toHaveCount(expectedCount);
  }

  /**
   * Verify the branch-level node count matches the expected number.
   */
  async verifyBranchNodeCount(expectedCount: number): Promise<void> {
    this.logger.info(`Verifying branch node count: expected ${expectedCount}`);
    await expect(this.sldPage.branchLevelNodes()).toHaveCount(expectedCount);
  }

  /**
   * Verify that a specific quantity value is displayed within the SLD for the
   * root-level product (first node at root).
   */
  async verifyRootProductQuantityInSld(expectedQty: number): Promise<void> {
    this.logger.info(`Verifying SLD root product quantity: ${expectedQty}`);
    const labels = await this.sldPage.getAllQuantityLabelTexts();
    this.logger.info(`SLD quantity labels found: ${JSON.stringify(labels)}`);
    const found = labels.some(l => l.includes(String(expectedQty)));
    expect(found, `Expected SLD to contain quantity ${expectedQty}, got: ${JSON.stringify(labels)}`).toBe(true);
  }

  /**
   * Verify that a specific quantity value is displayed within the SLD for the
   * branch-level product.
   */
  async verifyBranchProductQuantityInSld(expectedQty: number): Promise<void> {
    this.logger.info(`Verifying SLD branch product quantity: ${expectedQty}`);
    await expect(this.sldPage.branchLevelNodes().first()).toBeVisible();
    const labels = await this.sldPage.getAllQuantityLabelTexts();
    const found = labels.some(l => l.includes(String(expectedQty)));
    expect(found, `Expected SLD to contain branch quantity ${expectedQty}`).toBe(true);
  }

  /**
   * Verify the SLD hierarchy shows both root and branch levels.
   */
  async verifyHierarchyLevelsPresent(): Promise<void> {
    this.logger.info('Verifying SLD hierarchy shows root and branch levels');
    await expect(this.sldPage.rootLevel()).toBeVisible();
    await expect(this.sldPage.branchLevel()).toBeVisible();
  }

  /**
   * Verify the empty-state message is shown when no products are on the SLD.
   */
  async verifyEmptySldState(): Promise<void> {
    this.logger.info('Verifying empty SLD state');
    await expect(this.sldPage.emptySldMessage()).toBeVisible();
  }

  /**
   * Verify that the SLD loading spinner has resolved and canvas is visible.
   */
  async verifyLoadingStateThenResolves(): Promise<void> {
    this.logger.info('Verifying SLD loading state resolves');
    await this.sldPage.sldCanvas().waitFor({ state: 'visible', timeout: 30_000 });
    await expect(this.sldPage.loadingSpinner()).not.toBeVisible();
    this.logger.info('SLD loading state resolved');
  }
}
