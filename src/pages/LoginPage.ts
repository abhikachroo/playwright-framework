import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Cookie consent
  acceptCookiesBtn = () => this.page.getByRole('button', { name: /allow all|accept all|necessary only/i }).first();

  // Auth0 Universal Login — identifier step
  emailInput    = () => this.page.locator('#username, input[name="username"], input[name="email"], input[type="email"]').first();
  captchaWidget = () => this.page.locator('#ulp-auth0-v2-captcha, .ulp-auth0-v2-captcha, .ulp-captcha').first();
  continueBtn      = () => this.page.locator('button._button-login-id');
  auth0ContinueBtn = () => this.page.getByRole('button', { name: 'Continue' }).last();

  // Auth0 / IdP — password step
  passwordInput = () => this.page.locator('input[type="password"]:not([aria-hidden="true"]):not(.hide)');
  signInBtn     = () => this.page.getByRole('button', { name: /sign in|log in|login|submit/i });

  // Error
  errorMessage  = () => this.page.locator('[class*="error"], [class*="alert"], [role="alert"]').first();

  async dismissCookieBanner(): Promise<void> {
    const btn = this.page.getByRole('button', { name: /allow all/i });
    try {
      await btn.waitFor({ state: 'visible', timeout: 3000 });
      await btn.click();
      await this.page.locator('[class*="cookie"], [class*="privacy"], [id*="cookie"], [id*="privacy"]')
        .first()
        .waitFor({ state: 'hidden', timeout: 8000 })
        .catch(() => undefined);
      await this.page.waitForLoadState('domcontentloaded');
    } catch {
      // Banner not present — continue
    }
  }

  async fillEmail(email: string): Promise<void> {
    const input = this.emailInput();
    await input.fill(email);
  }

  async checkHumanVerification(): Promise<void> {
    // Already solved via hidden captcha token?
    const alreadySolved = await this.page.evaluate(() => {
      const names = ['cf-turnstile-response', 'h-captcha-response', 'g-recaptcha-response', 'captcha'];
      return names.some(n => {
        const el = document.querySelector<HTMLInputElement>(`input[name="${n}"]`);
        return !!(el && el.value);
      });
    });
    if (alreadySolved) return;

    // 1. Cloudflare Turnstile — Auth0 embeds the widget inside a shadow DOM container,
    //    so CSS selectors can't find the iframe. Use page.frames() to locate it directly.
    const turnstileFrame = this.page.frames().find(
      f => f.url().includes('challenges.cloudflare.com'),
    );
    if (turnstileFrame) {
      // Give Turnstile time to fully initialise before checking inner state
      await this.page.waitForTimeout(2_000);

      const innerSelectors = [
        '.ctp-checkbox-label',   // Turnstile flexible widget visual label
        'label',                  // Generic label wrapper
        '[role="checkbox"]',      // ARIA checkbox
        'input[type="checkbox"]', // Hidden checkbox (force click)
      ];

      for (const innerSel of innerSelectors) {
        try {
          const el = turnstileFrame.locator(innerSel).first();
          if (await el.isVisible({ timeout: 2_000 }).catch(() => false)) {
            await el.click({ force: true });
            await this.page.waitForTimeout(1_000);
            return;
          }
        } catch {
          // Selector not found in frame — try next
        }
      }

      // Fallback: mouse click at the left side (~25px) where the Turnstile checkbox renders.
      // The iframe is inside a shadow root so we walk shadow DOM to get its bounding rect.
      const box = await this.page.evaluate(() => {
        function findInShadow(root: Document | ShadowRoot): DOMRect | null {
          for (const el of root.querySelectorAll('*')) {
            if ((el as HTMLIFrameElement).src?.includes('challenges.cloudflare.com')) {
              return el.getBoundingClientRect();
            }
            if (el.shadowRoot) {
              const found = findInShadow(el.shadowRoot);
              if (found) return found;
            }
          }
          return null;
        }
        const r = findInShadow(document);
        return r ? { x: r.x, y: r.y, width: r.width, height: r.height } : null;
      });

      if (box && box.width > 0 && box.height > 0) {
        const checkboxX = box.x + 25;
        const checkboxY = box.y + box.height / 2;
        await this.page.mouse.move(checkboxX - 5, checkboxY);
        await this.page.waitForTimeout(200);
        await this.page.mouse.click(checkboxX, checkboxY);
        await this.page.waitForTimeout(1_000);
        return;
      }
    }

    // 2. Plain HTML checkbox directly in the page DOM (non-iframe captcha)
    const plainCheckbox = this.page
      .locator('input[type="checkbox"]:not([aria-hidden="true"])')
      .first();
    if (await plainCheckbox.isVisible({ timeout: 2_000 }).catch(() => false)) {
      const isChecked = await plainCheckbox.isChecked().catch(() => false);
      if (!isChecked) {
        await plainCheckbox.scrollIntoViewIfNeeded();
        await plainCheckbox.check({ force: true });
        await this.page.waitForTimeout(400);
      }
      return;
    }

    // 3. hCaptcha
    const hcaptcha = this.page.frameLocator('iframe[src*="hcaptcha.com"]').locator('#checkbox');
    if (await hcaptcha.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await hcaptcha.click();
      return;
    }

    // 4. reCAPTCHA
    const recaptcha = this.page.frameLocator('iframe[src*="recaptcha"]').locator('.recaptcha-checkbox');
    if (await recaptcha.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await recaptcha.click();
      return;
    }
  }

  async clickContinue(): Promise<void> {
    const btn = this.continueBtn();
    await btn.waitFor({ state: 'visible', timeout: 10_000 });
    // Wait until button is not disabled — checkbox validation may gate it
    await this.page.waitForFunction(
      () => !document.querySelector<HTMLButtonElement>('button._button-login-id')?.disabled,
      { timeout: 5_000 },
    ).catch(() => undefined);
    await btn.click();
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput().waitFor({ state: 'visible', timeout: 15_000 });
    await this.passwordInput().fill(password);
  }

  async waitForAuth0CaptchaSolved(timeout = 15_000): Promise<void> {
    // Auth0 embeds Turnstile in a shadow DOM, so we detect its presence via page.frames()
    // rather than CSS selectors. Pass the result into waitForFunction so the JS predicate
    // can apply the right early-return logic.
    const hasTurnstileFrame = this.page.frames().some(
      f => f.url().includes('challenges.cloudflare.com'),
    );

    try {
      await this.page.waitForFunction(
        (hasTurnstile: boolean) => {
          const names = ['captcha', 'cf-turnstile-response', 'h-captcha-response', 'g-recaptcha-response'];

          // Token filled — CAPTCHA solved
          if (names.some(n => {
            const el = document.querySelector<HTMLInputElement>(`input[name="${n}"]`);
            return !!(el && el.value);
          })) return true;

          // Turnstile frame is present but token not yet filled — keep waiting
          if (hasTurnstile) {
            const captchaInput = document.querySelector<HTMLInputElement>('input[name="captcha"]');
            if (captchaInput && !captchaInput.value) return false;
          }

          // Only count VISIBLE checkboxes as captcha — cookie consent checkboxes are hidden
          const visibleCheckbox = [...document.querySelectorAll<HTMLInputElement>(
            'input[type="checkbox"]:not([aria-hidden="true"])',
          )].find(cb => {
            const r = cb.getBoundingClientRect();
            return r.width > 0 && r.height > 0;
          }) ?? null;

          if (visibleCheckbox?.checked) return true;

          // No CAPTCHA infrastructure present — nothing to wait for
          const hasCaptchaIframe = !!document.querySelector(
            'iframe[src*="challenges.cloudflare.com"], iframe[src*="hcaptcha.com"], iframe[src*="recaptcha"]',
          );
          if (!hasCaptchaIframe && !visibleCheckbox) return true;

          return false;
        },
        hasTurnstileFrame,
        { timeout },
      );
    } catch {
      // Timed out — proceed anyway and let the Continue click reveal the real error
    }
  }

  async clickAuth0Continue(): Promise<void> {
    await this.auth0ContinueBtn().waitFor({ state: 'visible', timeout: 10_000 });
    await this.auth0ContinueBtn().click();
  }

  async clickSignIn(): Promise<void> {
    await this.signInBtn().click();
  }

  async getErrorText(): Promise<string> {
    return (await this.errorMessage().textContent()) ?? '';
  }
}
