import { test as base } from '@playwright/test';
import { LoginPage, SldPage } from '@pages/index';
import { LoginModule, SldFilterModule } from '@modules/index';

type TestFixtures = {
  loginPage: LoginPage;
  loginModule: LoginModule;
  sldPage: SldPage;
  sldFilterModule: SldFilterModule;
};

export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  loginModule: async ({ page, loginPage }, use) => {
    await use(new LoginModule(page, loginPage));
  },
  sldPage: async ({ page }, use) => {
    await use(new SldPage(page));
  },
  sldFilterModule: async ({ page, sldPage }, use) => {
    await use(new SldFilterModule(page, sldPage));
  },
});

export { expect } from '@playwright/test';
