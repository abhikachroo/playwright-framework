import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * SLDPage — Layer 2 (Locators & basic UI actions only).
 * Covers the Single Line Diagram page: diagram canvas,
 * product count labels at root and branch levels.
 *
 * ALL selectors marked // TODO: verify selector were inferred because
 * the application is behind an Akamai IP whitelist and could not be
 * inspected directly.
 */
export class SLDPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // ── Page-level ─────────────────────────────────────────────────────────────
  /** Main SLD diagram container */
  diagramContainer = (): Locator =>
    this.page.locator('[data-testid="sld-diagram"], .sld-diagram, [aria-label*="Single Line Diagram"]').first(); // TODO: verify selector

  /** Page heading confirming we are on the SLD page */
  sldPageHeading = (): Locator =>
    this.page.getByRole('heading', { name: /single line diagram|sld/i }).first(); // TODO: verify selector

  // ── Product representation in SLD ─────────────────────────────────────────
  /**
   * Root-level product node in the SLD diagram (by product name).
   * The node label typically shows "ProductName × N" or "ProductName (N)".
   */
  rootProductNode = (productName: string): Locator =>
    this.page.locator('[data-testid="sld-node"]').filter({ hasText: productName }).first(); // TODO: verify selector

  /**
   * Branch-level product node in the SLD diagram (by product name).
   */
  branchProductNode = (productName: string): Locator =>
    this.page.locator('[data-testid="sld-branch-node"]').filter({ hasText: productName }).first(); // TODO: verify selector

  /**
   * Quantity label shown on a root product node in the SLD.
   * Typically rendered as "×N", "(N)", or a standalone badge.
   */
  rootProductCountLabel = (productName: string): Locator =>
    this.rootProductNode(productName)
      .locator('[data-testid="qty-label"], .qty-label, [aria-label*="count"], [aria-label*="quantity"]').first(); // TODO: verify selector

  /**
   * Quantity label shown on a branch product node in the SLD.
   */
  branchProductCountLabel = (productName: string): Locator =>
    this.branchProductNode(productName)
      .locator('[data-testid="qty-label"], .qty-label, [aria-label*="count"], [aria-label*="quantity"]').first(); // TODO: verify selector

  /**
   * Generic locator for any count/quantity label anywhere on the SLD page.
   * Useful for counting total labelled nodes.
   */
  allCountLabels = (): Locator =>
    this.page.locator('[data-testid="qty-label"], .qty-label').filter({ hasNotText: '' }); // TODO: verify selector

  // ── Simple UI actions ──────────────────────────────────────────────────────

  async waitForDiagram(): Promise<void> {
    await this.diagramContainer().waitFor({ state: 'visible', timeout: 20_000 });
  }

  async getRootProductCountText(productName: string): Promise<string> {
    return (await this.rootProductCountLabel(productName).textContent()) ?? '';
  }

  async getBranchProductCountText(productName: string): Promise<string> {
    return (await this.branchProductCountLabel(productName).textContent()) ?? '';
  }

  async getDiagramText(): Promise<string> {
    return (await this.diagramContainer().textContent()) ?? '';
  }

  async countVisibleNodes(): Promise<number> {
    return this.page.locator('[data-testid="sld-node"], [data-testid="sld-branch-node"]').count(); // TODO: verify selector
  }
}
