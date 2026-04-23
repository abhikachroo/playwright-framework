import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * WorkbenchPage — Layer 2 (Locators & basic UI actions only).
 * Covers the switchboard workbench: product selection panel,
 * product cards, and quantity controls.
 *
 * ALL selectors marked // TODO: verify selector were inferred because
 * the application is behind an Akamai IP whitelist and could not be
 * inspected directly. Replace each TODO with the verified selector
 * found by running the locator extraction script on a whitelisted network.
 */
export class WorkbenchPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  /** Top-level "Projects" link in the main navigation */
  projectsNavLink = (): Locator =>
    this.page.getByRole('link', { name: /projects/i });

  /** Project card or row identified by project name */
  projectCard = (projectName: string): Locator =>
    this.page.getByRole('heading', { name: projectName });

  /** Switchboard item within a project */
  switchboardItem = (switchboardName: string): Locator =>
    this.page.getByRole('link', { name: switchboardName });

  // ── Products panel ─────────────────────────────────────────────────────────
  /** "Products" tab / section heading on the workbench */
  productsTabHeading = (): Locator =>
    this.page.getByRole('heading', { name: /products/i }).first(); // TODO: verify selector

  /** Search / filter input for the product catalogue */
  productSearchInput = (): Locator =>
    this.page.getByRole('searchbox').first(); // TODO: verify selector

  /** Individual product entry in the catalogue panel (by display name) */
  productCatalogueItem = (productName: string): Locator =>
    this.page.getByRole('listitem').filter({ hasText: productName }).first(); // TODO: verify selector

  /** "Add" button on a catalogue product item */
  addProductBtn = (productName: string): Locator =>
    this.page.getByRole('listitem').filter({ hasText: productName })
      .getByRole('button', { name: /add/i }); // TODO: verify selector

  // ── Workbench canvas cards ─────────────────────────────────────────────────
  /** Root-level product card on the workbench canvas (by product name) */
  rootProductCard = (productName: string): Locator =>
    this.page.locator('[data-testid="product-card"]').filter({ hasText: productName }).first(); // TODO: verify selector

  /** End-of-branch product card (child/branch level) */
  branchProductCard = (productName: string): Locator =>
    this.page.locator('[data-testid="branch-product-card"]').filter({ hasText: productName }).first(); // TODO: verify selector

  /** Quantity input box displayed on a root product card */
  rootProductQtyInput = (productName: string): Locator =>
    this.rootProductCard(productName).locator('input[type="number"], [data-testid="qty-input"]').first(); // TODO: verify selector

  /** Quantity input box displayed on a branch product card */
  branchProductQtyInput = (productName: string): Locator =>
    this.branchProductCard(productName).locator('input[type="number"], [data-testid="qty-input"]').first(); // TODO: verify selector

  /** Quantity increment (+) button on a root product card */
  rootQtyIncrementBtn = (productName: string): Locator =>
    this.rootProductCard(productName).getByRole('button', { name: '+' }); // TODO: verify selector

  /** Quantity decrement (−) button on a root product card */
  rootQtyDecrementBtn = (productName: string): Locator =>
    this.rootProductCard(productName).getByRole('button', { name: '-' }); // TODO: verify selector

  /** Quantity increment (+) button on a branch product card */
  branchQtyIncrementBtn = (productName: string): Locator =>
    this.branchProductCard(productName).getByRole('button', { name: '+' }); // TODO: verify selector

  /** Quantity decrement (−) button on a branch product card */
  branchQtyDecrementBtn = (productName: string): Locator =>
    this.branchProductCard(productName).getByRole('button', { name: '-' }); // TODO: verify selector

  /** The visible quantity badge/label shown on the product card */
  rootProductQtyBadge = (productName: string): Locator =>
    this.rootProductCard(productName).locator('[data-testid="qty-badge"], .qty-badge, [aria-label*="quantity"]').first(); // TODO: verify selector

  /** The visible quantity badge/label shown on the branch product card */
  branchProductQtyBadge = (productName: string): Locator =>
    this.branchProductCard(productName).locator('[data-testid="qty-badge"], .qty-badge, [aria-label*="quantity"]').first(); // TODO: verify selector

  // ── Navigation to other pages ──────────────────────────────────────────────
  /** "SLD" navigation link / tab from the workbench */
  sldNavLink = (): Locator =>
    this.page.getByRole('link', { name: /sld/i }); // TODO: verify selector

  /** "Export" navigation link / tab */
  exportNavLink = (): Locator =>
    this.page.getByRole('link', { name: /export/i }); // TODO: verify selector

  // ── Simple UI actions ──────────────────────────────────────────────────────

  async clickProjectsNav(): Promise<void> {
    await this.projectsNavLink().click();
  }

  async openProject(projectName: string): Promise<void> {
    await this.projectCard(projectName).click();
  }

  async openSwitchboard(switchboardName: string): Promise<void> {
    await this.switchboardItem(switchboardName).click();
    await this.waitForPageLoad();
  }

  async searchProduct(query: string): Promise<void> {
    await this.productSearchInput().fill(query);
  }

  async addProductToWorkbench(productName: string): Promise<void> {
    await this.addProductBtn(productName).click();
  }

  async setRootProductQuantity(productName: string, quantity: number): Promise<void> {
    const input = this.rootProductQtyInput(productName);
    await input.clear();
    await input.fill(String(quantity));
  }

  async setBranchProductQuantity(productName: string, quantity: number): Promise<void> {
    const input = this.branchProductQtyInput(productName);
    await input.clear();
    await input.fill(String(quantity));
  }

  async incrementRootQty(productName: string): Promise<void> {
    await this.rootQtyIncrementBtn(productName).click();
  }

  async decrementRootQty(productName: string): Promise<void> {
    await this.rootQtyDecrementBtn(productName).click();
  }

  async incrementBranchQty(productName: string): Promise<void> {
    await this.branchQtyIncrementBtn(productName).click();
  }

  async decrementBranchQty(productName: string): Promise<void> {
    await this.branchQtyDecrementBtn(productName).click();
  }

  async navigateToSLD(): Promise<void> {
    await this.sldNavLink().click();
    await this.waitForPageLoad();
  }

  async navigateToExport(): Promise<void> {
    await this.exportNavLink().click();
    await this.waitForPageLoad();
  }

  async getRootProductQtyValue(productName: string): Promise<string> {
    return (await this.rootProductQtyInput(productName).inputValue()) ?? '';
  }

  async getBranchProductQtyValue(productName: string): Promise<string> {
    return (await this.branchProductQtyInput(productName).inputValue()) ?? '';
  }
}
