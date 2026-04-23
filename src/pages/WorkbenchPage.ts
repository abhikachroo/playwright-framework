import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class WorkbenchPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // ── Products Selection page header ────────────────────────────────────────
  productsSelectionHeading = () => this.page.getByRole('heading', { name: /products selection/i }).first();
  pageLoadedIndicator      = () => this.page.locator('[data-testid="workbench-container"]').first(); // TODO: verify selector

  // ── Product catalogue / search ────────────────────────────────────────────
  productSearchInput       = () => this.page.getByRole('searchbox').first(); // TODO: verify selector
  productSearchBtn         = () => this.page.getByRole('button', { name: /search/i }).first();
  productCataloguePanel    = () => this.page.locator('[data-testid="product-catalogue"], [class*="catalogue"]').first(); // TODO: verify selector

  // ── Add product at root level ─────────────────────────────────────────────
  rootLevelAddBtn          = () => this.page.getByRole('button', { name: /add product|add at root/i }).first(); // TODO: verify selector
  productCardInCatalogue   = (name: string) => this.page.getByRole('button', { name }).first();
  firstProductInCatalogue  = () => this.page.locator('[data-testid="product-item"], [class*="product-item"]').first(); // TODO: verify selector
  addToRootBtn             = () => this.page.getByRole('button', { name: /add to root/i }).first(); // TODO: verify selector

  // ── Add product at end-of-branch level ───────────────────────────────────
  branchNodeSelector       = () => this.page.locator('[data-testid="branch-node"], [class*="branch-node"]').first(); // TODO: verify selector
  addToBranchBtn           = () => this.page.getByRole('button', { name: /add to branch|add end of branch/i }).first(); // TODO: verify selector

  // ── Quantity controls ─────────────────────────────────────────────────────
  quantityInput            = () => this.page.getByRole('spinbutton').first();
  quantityInputByLabel     = (label: string) => this.page.getByLabel(label); // TODO: verify selector
  quantityIncrementBtn     = () => this.page.getByRole('button', { name: /increment|\+/i }).first(); // TODO: verify selector
  quantityDecrementBtn     = () => this.page.getByRole('button', { name: /decrement|-/i }).first(); // TODO: verify selector
  confirmQuantityBtn       = () => this.page.getByRole('button', { name: /confirm|apply|ok/i }).first(); // TODO: verify selector

  // ── Added product cards (canvas / tree) ───────────────────────────────────
  productCardsOnCanvas     = () => this.page.locator('[data-testid="product-card"], [class*="product-card"]');
  quantityBadgeOnCard      = () => this.page.locator('[data-testid="quantity-badge"], [class*="quantity-badge"]').first(); // TODO: verify selector
  quantityBoxOnCard        = () => this.page.locator('[data-testid="quantity-box"], [class*="quantity"]').first(); // TODO: verify selector
  rootLevelProductCards    = () => this.page.locator('[data-testid="root-product-card"], [data-level="root"]');
  branchLevelProductCards  = () => this.page.locator('[data-testid="branch-product-card"], [data-level="branch"]');

  // ── Validation messages ───────────────────────────────────────────────────
  quantityValidationError  = () => this.page.locator('[role="alert"], [data-testid="quantity-error"], [class*="validation-error"]').first(); // TODO: verify selector

  // ── Navigation tabs ───────────────────────────────────────────────────────
  sldTabBtn                = () => this.page.getByRole('tab', { name: /sld/i }).first();
  exportTabBtn             = () => this.page.getByRole('tab', { name: /export/i }).first();
  productsTabBtn           = () => this.page.getByRole('tab', { name: /products selection/i }).first();

  // ── Actions ───────────────────────────────────────────────────────────────
  async fillQuantityInput(value: number): Promise<void> {
    const input = this.quantityInput();
    await input.clear();
    await input.fill(String(value));
  }

  async fillQuantityInputByLabel(label: string, value: number): Promise<void> {
    const input = this.quantityInputByLabel(label);
    await input.clear();
    await input.fill(String(value));
  }

  async clickFirstProductInCatalogue(): Promise<void> {
    await this.firstProductInCatalogue().click();
  }

  async clickAddToRoot(): Promise<void> {
    await this.addToRootBtn().click();
  }

  async clickAddToBranch(): Promise<void> {
    await this.addToBranchBtn().click();
  }

  async clickConfirmQuantity(): Promise<void> {
    await this.confirmQuantityBtn().click();
  }

  async clickSldTab(): Promise<void> {
    await this.sldTabBtn().click();
  }

  async clickExportTab(): Promise<void> {
    await this.exportTabBtn().click();
  }

  async getQuantityBoxText(): Promise<string> {
    return (await this.quantityBoxOnCard().textContent()) ?? '';
  }

  async getValidationErrorText(): Promise<string> {
    return (await this.quantityValidationError().textContent()) ?? '';
  }

  async getProductCardCount(): Promise<number> {
    return this.productCardsOnCanvas().count();
  }
}
