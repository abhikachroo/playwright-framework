import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProjectPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // ── Project list ──────────────────────────────────────────────────────────
  projectListHeading   = () => this.page.getByRole('heading', { name: /projects/i }).first();
  createProjectBtn     = () => this.page.getByRole('button', { name: /new project|create project/i }).first();
  projectSearchInput   = () => this.page.getByRole('searchbox').first(); // TODO: verify selector
  projectCard          = (name: string) => this.page.getByRole('button', { name }).first();
  projectCardByIndex   = (idx: number) => this.page.locator('[data-testid="project-card"]').nth(idx); // TODO: verify selector
  firstProjectCard     = () => this.page.locator('[data-testid="project-card"]').first(); // TODO: verify selector

  // ── Inside a project ──────────────────────────────────────────────────────
  projectTitle         = () => this.page.getByRole('heading', { level: 1 }).first();
  switchboardSection   = () => this.page.locator('[data-testid="switchboard-section"]').first(); // TODO: verify selector
  switchboardItem      = (name: string) => this.page.getByRole('link', { name }).first();
  firstSwitchboardItem = () => this.page.locator('[data-testid="switchboard-item"]').first(); // TODO: verify selector
  addSwitchboardBtn    = () => this.page.getByRole('button', { name: /add switchboard|new switchboard/i }).first();

  // ── Navigation breadcrumbs ────────────────────────────────────────────────
  breadcrumb           = () => this.page.locator('nav[aria-label="breadcrumb"], [data-testid="breadcrumb"]').first(); // TODO: verify selector

  // ── Actions ───────────────────────────────────────────────────────────────
  async clickFirstProject(): Promise<void> {
    await this.firstProjectCard().click();
  }

  async clickProjectByName(name: string): Promise<void> {
    await this.projectCard(name).click();
  }

  async clickFirstSwitchboard(): Promise<void> {
    await this.firstSwitchboardItem().click();
  }

  async clickSwitchboardByName(name: string): Promise<void> {
    await this.switchboardItem(name).click();
  }

  async getProjectTitle(): Promise<string> {
    return (await this.projectTitle().textContent()) ?? '';
  }
}
