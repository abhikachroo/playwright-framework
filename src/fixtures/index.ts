import { test as base } from '@playwright/test';
import { LoginPage } from '@pages/index';
import { HomePage } from '@pages/index';
import { LoginModule } from '@modules/index';

type TestFixtures = {
  loginPage: LoginPage;
  homePage: HomePage;
  loginModule: LoginModule;
};

export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  loginModule: async ({ page, loginPage, homePage }, use) => {
    await use(new LoginModule(page, loginPage, homePage));
  },
});

export { expect } from '@playwright/test';
