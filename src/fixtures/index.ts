import { test as base } from '@playwright/test';
import { LoginPage, ProjectPage, WorkbenchPage, SLDPage, ExportPage } from '@pages/index';
import { LoginModule, ProjectModule, WorkbenchModule, SLDModule, ExportModule } from '@modules/index';

type TestFixtures = {
  // ── Layer 2: Pages ───────────────────────────────────────────────────────────
  loginPage: LoginPage;
  projectPage: ProjectPage;
  workbenchPage: WorkbenchPage;
  sldPage: SLDPage;
  exportPage: ExportPage;

  // ── Layer 3: Modules ──────────────────────────────────────────────────────
  loginModule: LoginModule;
  projectModule: ProjectModule;
  workbenchModule: WorkbenchModule;
  sldModule: SLDModule;
  exportModule: ExportModule;

  // ── Composite: authenticated session ─────────────────────────────────────────
  authenticatedPage: void;

  // ── Composite: authenticated + navigated to switchboard ────────────────────────
  switchboardPage: void;
};

export const test = base.extend<TestFixtures>({
  // ── Pages ────────────────────────────────────────────────────────────────
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  projectPage: async ({ page }, use) => {
    await use(new ProjectPage(page));
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

  // ── Modules ────────────────────────────────────────────────────────────────
  loginModule: async ({ page, loginPage }, use) => {
    await use(new LoginModule(page, loginPage));
  },

  projectModule: async ({ page, projectPage }, use) => {
    await use(new ProjectModule(page, projectPage));
  },

  workbenchModule: async ({ page, workbenchPage }, use) => {
    await use(new WorkbenchModule(page, workbenchPage));
  },

  sldModule: async ({ page, sldPage }, use) => {
    await use(new SLDModule(page, sldPage));
  },

  exportModule: async ({ page, exportPage }, use) => {
    await use(new ExportModule(page, exportPage));
  },

  // ── Composite: performs login before the test body runs ───────────────────────
  authenticatedPage: [
    async ({ loginModule }, use) => {
      await loginModule.doLogin();
      await use();
    },
    { auto: false },
  ],

  // ── Composite: login + navigate to switchboard Products Selection page ────────
  switchboardPage: [
    async ({ loginModule, projectModule }, use) => {
      await loginModule.doLogin();
      await projectModule.navigateToSwitchboard();
      await use();
    },
    { auto: false },
  ],
});

export { expect } from '@playwright/test';
