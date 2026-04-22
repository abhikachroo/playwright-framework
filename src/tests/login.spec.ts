import { test, expect } from '@fixtures';
import { config } from '@config/index';

test.describe(`@P0 @Smoke @Login Login -- ${config.displayName} [${config.environment}]`, () => {
  test('should login successfully with valid credentials', async ({ loginModule, loginPage }) => {
    await test.step('Navigate to login page and submit valid credentials', async () => {
      await loginModule.doLogin();
    });

    await test.step('Verify successful login — URL no longer points to login path', async () => {
      const currentUrl = await loginModule.getCurrentUrl();
      expect(currentUrl).not.toContain('/login');
      expect(currentUrl).toContain(new URL(config.baseUrl).hostname);
    });

    await test.step('Verify page title is present after login', async () => {
      const title = await loginPage.getTitle();
      expect(title).toBeTruthy();
    });
  });
});
