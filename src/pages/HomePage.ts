import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * HomePage — post-login landing page and logged-out homepage.
 *
 * Locator notes:
 * - loginLink: confirmed via live browse (role+text)
 * - searchInput: confirmed via live browse (data-testid)
 * - userAccountBtn, logoutBtn: unconfirmed — require authenticated session to verify.
 *   Marked with TODO comments below.
 */
export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Logged-out homepage
  loginLink   = () => this.page.getByRole('link', { name: 'Login' });
  searchInput = () => this.page.getByTestId('search-bar-input');

  // Post-login authenticated header
  // TODO: verify selector — requires authenticated browse to confirm exact locator
  userAccountBtn = () => this.page.locator('[class*="account"], [data-testid*="account"], [aria-label*="account" i]').first();

  // Logout — unconfirmed; update after first authenticated run
  // TODO: verify selector — open account menu first, then locate logout link/button
  logoutBtn = () => this.page.getByRole('button', { name: /log.?out|sign.?out/i });
  logoutLink = () => this.page.getByRole('link', { name: /log.?out|sign.?out/i });

  /** Navigate to the application root. */
  async goHome(): Promise<void> {
    await this.navigate('/');
    await this.waitForPageLoad();
  }

  /** Click the Login link on the logged-out homepage. */
  async clickLoginLink(): Promise<void> {
    await this.loginLink().click();
  }

  /** Open the user account dropdown/menu (if applicable). */
  async openAccountMenu(): Promise<void> {
    await this.userAccountBtn().click();
  }

  /** Click the logout button or link after opening account menu. */
  async clickLogout(): Promise<void> {
    // Try button first, fall back to link
    const btn = this.logoutBtn();
    const link = this.logoutLink();
    const btnVisible = await btn.isVisible({ timeout: 3_000 }).catch(() => false);
    if (btnVisible) {
      await btn.click();
    } else {
      await link.click();
    }
  }

  /** Return true if the authenticated user account element is visible. */
  async isUserAuthenticated(): Promise<boolean> {
    return this.userAccountBtn().isVisible({ timeout: 5_000 }).catch(() => false);
  }

  /** Dismiss cookie consent banner if present. */
  async dismissCookieBanner(): Promise<void> {
    const btn = this.page.getByRole('button', { name: /allow all|accept all/i });
    try {
      await btn.waitFor({ state: 'visible', timeout: 3_000 });
      await btn.click();
    } catch {
      // Banner not present — continue
    }
  }
}
