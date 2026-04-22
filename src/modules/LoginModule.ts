import { Page } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';
import { Logger } from '@utils/Logger';
import { config } from '@config/index';

export class LoginModule {
  private logger: Logger;

  constructor(
    private page: Page,
    private loginPage: LoginPage,
  ) {
    this.logger = new Logger('LoginModule');
  }

  async doLogin(
    username: string = config.username,
    password: string = config.password,
  ): Promise<void> {
    this.logger.info(`[${config.displayName}][${config.environment}] Logging in as: ${username}`);

    // Step 1 — App login page: submit email to initiate OAuth flow
    await this.loginPage.navigate(config.loginPath);
    await this.loginPage.waitForPageLoad();
    await this.loginPage.dismissCookieBanner();
    await this.loginPage.fillEmail(username);
    await this.loginPage.checkHumanVerification();
    await this.loginPage.waitForAuth0CaptchaSolved();
    await this.loginPage.clickContinue();

    // Step 2 — Auth0 identifier page: re-enter email and advance to password
    await this.page.waitForLoadState('domcontentloaded', { timeout: 20_000 });
    this.logger.info(`Landed on: ${this.page.url()}`);

    if (this.page.url().includes('identifier')) {
      // Let Turnstile auto-solve BEFORE touching the email field.
      // Calling fillEmail() triggers a React re-render that resets the Turnstile
      // widget (from visible 1600×150 back to 0×0), preventing token generation.
      await this.loginPage.waitForAuth0CaptchaSolved(8_000);

      // Only fill email if the field is empty — Auth0 pre-fills it from the previous
      // step's state, so a second fillEmail() call is usually not needed.
      const emailValue = await this.loginPage.emailInput().inputValue().catch(() => '');
      if (!emailValue) {
        await this.loginPage.fillEmail(username);
      }

      // Handle interactive Turnstile checkbox (shown when CF needs extra verification)
      await this.loginPage.checkHumanVerification();
      // Final wait — covers re-initialisation after email fill or interactive click
      await this.loginPage.waitForAuth0CaptchaSolved(15_000);

      await this.loginPage.clickAuth0Continue();

      // If Turnstile wasn't solved in time, Auth0 silently blocks submission and the page
      // stays on /identifier. Detect this and retry captcha + continue once.
      const leftIdentifier = await this.page
        .waitForURL(url => !url.pathname.includes('/identifier'), { timeout: 6_000 })
        .then(() => true)
        .catch(() => false);

      if (!leftIdentifier) {
        this.logger.info('Still on identifier after first Continue — retrying captcha');
        await this.loginPage.checkHumanVerification();
        await this.loginPage.waitForAuth0CaptchaSolved(25_000);
        await this.loginPage.clickAuth0Continue();
        await this.page.waitForURL(url => !url.pathname.includes('/identifier'), { timeout: 30_000 });
      }

      this.logger.info(`After Auth0 continue: ${this.page.url()}`);
    }

    // Step 3 — Password page: fill password and sign in
    await this.loginPage.fillPassword(password);
    await this.loginPage.clickSignIn();
    await this.loginPage.waitForPageLoad();
    this.logger.info('Login completed');
  }

  async verifyLoginFailed(expectedError: string): Promise<void> {
    const { expect } = await import('@playwright/test');
    const errorText = await this.loginPage.getErrorText();
    expect(errorText).toContain(expectedError);
    this.logger.warn(`Login failed as expected: ${expectedError}`);
  }

  async getCurrentUrl(): Promise<string> {
    return this.loginPage.getCurrentUrl();
  }
}
