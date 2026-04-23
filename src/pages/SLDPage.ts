import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class SLDPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // ── Page heading ──────────────────────────────────────────────────────────
  sldHeading          = () => this.page.getByRole('heading', { name: /single line diagram|sld/i }).first();
  sldCanvas           = () => this.page.locator('[data-testid="sld-canvas"], [class*="sld-canvas"], svg').first(); // TODO: verify selector
  sldLoadedIndicator  = () => this.page.locator('[data-testid="sld-container"]').first(); // TODO: verify selector

  // ── SLD product nodes ─────────────────────────────────────────────────────
  allSldNodes         = () => this.page.locator('[data-testid="sld-node"], [class*="sld-node"]');
  rootLevelNodes      = () => this.page.locator('[data-testid="sld-root-node"], [data-sld-level="root"]');
  branchLevelNodes    = () => this.page.locator('[data-testid="sld-branch-node"], [data-sld-level="branch"]');

  // ── Quantity display within SLD nodes ─────────────────────────────────────
  quantityLabelInNode = (nodeIndex: number) =>
    this.page.locator('[data-testid="sld-node"]').nth(nodeIndex).locator('[data-testid="node-quantity"]').first(); // TODO: verify selector
  allQuantityLabels   = () => this.page.locator('[data-testid="node-quantity"], [class*="node-quantity"]');

  // ── Level hierarchy structure ─────────────────────────────────────────────
  hierarchyContainer  = () => this.page.locator('[data-testid="sld-hierarchy"], [class*="hierarchy"]').first(); // TODO: verify selector
  rootLevel           = () => this.page.locator('[data-sld-level="root"], [data-testid="sld-level-root"]').first(); // TODO: verify selector
  branchLevel         = () => this.page.locator('[data-sld-level="branch"], [data-testid="sld-level-branch"]').first(); // TODO: verify selector

  // ── Empty state ───────────────────────────────────────────────────────────
  emptySldMessage     = () => this.page.locator('[data-testid="sld-empty"], [class*="empty-state"]').first(); // TODO: verify selector

  // ── Loading state ─────────────────────────────────────────────────────────
  loadingSpinner      = () => this.page.locator('[data-testid="loading-spinner"], [role="progressbar"], [class*="spinner"]').first(); // TODO: verify selector

  // ── Actions ───────────────────────────────────────────────────────────────
  async getRootNodeCount(): Promise<number> {
    return this.rootLevelNodes().count();
  }

  async getBranchNodeCount(): Promise<number> {
    return this.branchLevelNodes().count();
  }

  async getAllNodeCount(): Promise<number> {
    return this.allSldNodes().count();
  }

  async getQuantityLabelText(nodeIndex: number): Promise<string> {
    return (await this.quantityLabelInNode(nodeIndex).textContent()) ?? '';
  }

  async getAllQuantityLabelTexts(): Promise<string[]> {
    const labels = this.allQuantityLabels();
    const count = await labels.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      texts.push((await labels.nth(i).textContent()) ?? '');
    }
    return texts;
  }

  async isEmptyStateVisible(): Promise<boolean> {
    return this.emptySldMessage().isVisible();
  }
}
