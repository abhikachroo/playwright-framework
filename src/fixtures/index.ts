import { test as base } from '@playwright/test';
import { LoginPage } from '@pages/index';
import { LoginModule } from '@modules/index';

type TestFixtures = {
  loginPage: LoginPage;
  loginModule: LoginModule;
};

export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  loginModule: async ({ page, loginPage }, use) => {
    await use(new LoginModule(page, loginPage));
  },
});

export { expect } from '@playwright/test';
