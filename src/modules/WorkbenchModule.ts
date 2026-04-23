import { Page, expect } from '@playwright/test';
import { WorkbenchPage } from '@pages/WorkbenchPage';
import { Logger } from '@utils/Logger';

export class WorkbenchModule {
  private logger: Logger;

  constructor(
    private page: Page,
    private workbenchPage: WorkbenchPage,
  ) {
    this.logger = new Logger('WorkbenchModule');
  }

  /**
   * Wait for the Products Selection page to be fully loaded.
   */
  async waitForProductsSelectionPage(): Promise<void> {
    this.logger.info('Waiting for Products Selection page');
    await this.workbenchPage.productsSelectionHeading().waitFor({ state: 'visible', timeout: 20_000 });
    this.logger.info('Products Selection page loaded');
  }

  /**
   * Add the first available product at root level and set the given quantity.
   * Assumes Products Selection page is already open.
   */
  async addRootProductWithQuantity(quantity: number): Promise<void> {
    this.logger.info(`Adding root-level product with quantity: ${quantity}`);
    await this.workbenchPage.clickFirstProductInCatalogue();
    await this.workbenchPage.clickAddToRoot();
    await this.workbenchPage.fillQuantityInput(quantity);
    await this.workbenchPage.clickConfirmQuantity();
    this.logger.info(`Root product added with quantity ${quantity}`);
  }

  /**
   * Add the first available product at end-of-branch level and set quantity.
   */
  async addBranchProductWithQuantity(quantity: number): Promise<void> {
    this.logger.info(`Adding branch-level product with quantity: ${quantity}`);
    await this.workbenchPage.clickFirstProductInCatalogue();
    await this.workbenchPage.clickAddToBranch();
    await this.workbenchPage.fillQuantityInput(quantity);
    await this.workbenchPage.clickConfirmQuantity();
    this.logger.info(`Branch product added with quantity ${quantity}`);
  }

  /**
   * Attempt to set an invalid quantity value and verify validation fires.
   */
  async attemptInvalidQuantity(value: number): Promise<void> {
    this.logger.info(`Attempting invalid quantity: ${value}`);
    await this.workbenchPage.clickFirstProductInCatalogue();
    await this.workbenchPage.clickAddToRoot();
    await this.workbenchPage.fillQuantityInput(value);
    await this.page.keyboard.press('Tab');
    this.logger.info(`Invalid quantity ${value} entered — expecting validation error`);
  }

  /**
   * Verify that a quantity box is displayed on the product card.
   */
  async verifyQuantityBoxOnCard(expectedQty: number): Promise<void> {
    this.logger.info(`Verifying quantity box shows: ${expectedQty}`);
    await expect(this.workbenchPage.quantityBoxOnCard()).toBeVisible();
    await expect(this.workbenchPage.quantityBoxOnCard()).toContainText(String(expectedQty));
  }

  /**
   * Navigate to the SLD tab.
   */
  async navigateToSldTab(): Promise<void> {
    this.logger.info('Navigating to SLD tab');
    await this.workbenchPage.clickSldTab();
    await this.workbenchPage.waitForPageLoad();
  }

  /**
   * Navigate to the Export tab.
   */
  async navigateToExportTab(): Promise<void> {
    this.logger.info('Navigating to Export tab');
    await this.workbenchPage.clickExportTab();
    await this.workbenchPage.waitForPageLoad();
  }

  /**
   * Verify validation error is shown for an invalid quantity.
   */
  async verifyQuantityValidationError(expectedMessage: string): Promise<void> {
    this.logger.info(`Verifying quantity validation error: "${expectedMessage}"`);
    await expect(this.workbenchPage.quantityValidationError()).toBeVisible();
    await expect(this.workbenchPage.quantityValidationError()).toContainText(expectedMessage);
  }
}
