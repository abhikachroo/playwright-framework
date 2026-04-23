import { test, expect } from '@fixtures';
import { config } from '@config/index';

test.describe(`@P0 @Smoke @Login Login -- ${config.displayName} [${config.environment}]`, () => {
  test('should login successfully with valid credentials', async ({ loginModule, page }) => {
    await loginModule.doLogin();
    await expect(page).toHaveURL(new RegExp(new URL(config.baseUrl).hostname));
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).toHaveTitle(/.+/);
  });
});
