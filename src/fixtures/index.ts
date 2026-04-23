import { test as base } from '@playwright/test';
import { LoginPage, WorkbenchPage, SLDPage, ExportPage } from '@pages/index';
import { LoginModule, ManageQuantityModule } from '@modules/index';

type TestFixtures = {
  loginPage: LoginPage;
  loginModule: LoginModule;
  workbenchPage: WorkbenchPage;
  sldPage: SLDPage;
  exportPage: ExportPage;
  manageQuantityModule: ManageQuantityModule;
};

export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  loginModule: async ({ page, loginPage }, use) => {
    await use(new LoginModule(page, loginPage));
  },
  workbenchPage: async ({ page }, use) => {
    await use(new WorkbenchPage(page));
  },
  sldPage: async ({ page }, use) => {
    await use(new SLDPage(page));
  },
  exportPage: async ({ page }, use) => {
    await use(new ExportPage(page));
  },
  manageQuantityModule: async ({ page, workbenchPage, sldPage, exportPage }, use) => {
    await use(new ManageQuantityModule(page, workbenchPage, sldPage, exportPage));
  },
});

export { expect } from '@playwright/test';
