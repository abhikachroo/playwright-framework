/**
 * Manage Quantity - SLD (OPT1-5608)
 * Spec file 1 of 2: TC-001 – TC-015
 * Priority coverage: P0 (Smoke) + P1 (Core happy path)
 *
 * Prerequisites (handled by auth.setup.ts + chromium project):
 *  - User is authenticated as gregorio0@ngainitr.com / HM_Auto_tests1
 *  - A Project named PROJECT_NAME exists
 *  - A Switchboard named SWITCHBOARD_NAME is configured within it
 *
 * ⚠️  NOTE: All page locators are best-effort inferences (app is behind Akamai
 *     IP whitelist). Run the locator extraction script on a whitelisted network
 *     and replace all `// TODO: verify selector` comments before production use.
 */

import { test, expect } from '@fixtures';
import { config } from '@config/index';

// ── Test data constants ──────────────────────────────────────────────────────
const PROJECT_NAME     = 'Test Project';       // TODO: replace with actual project name in test environment
const SWITCHBOARD_NAME = 'Test Switchboard';   // TODO: replace with actual switchboard name in test environment
const ROOT_PRODUCT     = 'Busbar';             // Fixed catalogue product — adjust to actual available product
const BRANCH_PRODUCT   = 'Circuit Breaker';    // End-of-branch product — adjust to actual available product

// ── Describe block ────────────────────────────────────────────────────────────

test.describe(`@P0 @P1 @Smoke @ManageQuantity Manage Quantity - SLD — ${config.displayName} [${config.environment}]`, () => {

  // ────────────────────────────────────────────────────────────────────────────
  // TC-001  P0 | Smoke — Workbench navigation
  // ────────────────────────────────────────────────────────────────────────────
  test('TC-001: Navigate to switchboard workbench — Products panel is displayed', async ({
    workbenchPage,
    manageQuantityModule,
  }) => {
    await test.step('Navigate to the switchboard workbench via Projects nav', async () => {
      await manageQuantityModule.navigateToSwitchboard(PROJECT_NAME, SWITCHBOARD_NAME);
    });

    await test.step('Verify the Products selection panel is visible', async () => {
      await manageQuantityModule.verifyWorkbenchLoaded();
      await expect(workbenchPage.productsTabHeading()).toBeVisible();
    });

    await test.step('Verify the current URL contains the switchboard path', async () => {
      await manageQuantityModule.verifyWorkbenchUrl();
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TC-002  P0 | Smoke — Root product quantity box visible
  // ────────────────────────────────────────────────────────────────────────────
  test('TC-002: Add root-level product and set quantity > 1 — quantity box is shown on card', async ({
    manageQuantityModule,
  }) => {
    await test.step('Navigate to the switchboard workbench', async () => {
      await manageQuantityModule.navigateToSwitchboard(PROJECT_NAME, SWITCHBOARD_NAME);
    });

    await test.step('Add a root-level product to the workbench with quantity 2', async () => {
      await manageQuantityModule.addRootProductWithQuantity(ROOT_PRODUCT, 2);
    });

    await test.step('Verify the quantity input box is visible on the product card', async () => {
      await manageQuantityModule.verifyRootProductQtyBoxVisible(ROOT_PRODUCT);
    });

    await test.step('Verify the quantity value displayed is 2', async () => {
      await manageQuantityModule.verifyRootProductQtyValue(ROOT_PRODUCT, 2);
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TC-003  P0 | Smoke — Branch product quantity box visible
  // ────────────────────────────────────────────────────────────────────────────
  test('TC-003: Add end-of-branch product and set quantity > 1 — quantity box is shown on card', async ({
    manageQuantityModule,
  }) => {
    await test.step('Navigate to the switchboard workbench', async () => {
      await manageQuantityModule.navigateToSwitchboard(PROJECT_NAME, SWITCHBOARD_NAME);
    });

    await test.step('Add a branch-level product and set quantity to 3', async () => {
      await manageQuantityModule.addBranchProductWithQuantity(BRANCH_PRODUCT, 3);
    });

    await test.step('Verify quantity box is visible on the branch product card', async () => {
      await manageQuantityModule.verifyBranchProductQtyBoxVisible(BRANCH_PRODUCT);
    });

    await test.step('Verify quantity value is 3 on the branch card', async () => {
      await manageQuantityModule.verifyBranchProductQtyValue(BRANCH_PRODUCT, 3);
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TC-004  P0 | Smoke — SLD page loads and shows product nodes
  // ────────────────────────────────────────────────────────────────────────────
  test('TC-004: Navigate to SLD page — diagram loads and product nodes are displayed', async ({
    sldPage,
    manageQuantityModule,
  }) => {
    await test.step('Navigate to the switchboard workbench', async () => {
      await manageQuantityModule.navigateToSwitchboard(PROJECT_NAME, SWITCHBOARD_NAME);
    });

    await test.step('Add root product with quantity 2', async () => {
      await manageQuantityModule.addRootProductWithQuantity(ROOT_PRODUCT, 2);
    });

    await test.step('Navigate to the SLD page', async () => {
      await manageQuantityModule.navigateToSLDPage();
    });

    await test.step('Verify SLD diagram container is visible', async () => {
      await expect(sldPage.diagramContainer()).toBeVisible();
    });

    await test.step('Verify the root product node is displayed in the SLD', async () => {
      await manageQuantityModule.verifySLDNodeVisible(ROOT_PRODUCT);
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TC-005  P1 | Core — Root product count shown in SLD
  // ────────────────────────────────────────────────────────────────────────────
  test('TC-005: Root product with qty 2 — SLD shows count of 2 on product node', async ({
    manageQuantityModule,
  }) => {
    await test.step('Navigate to workbench and set root product qty to 2', async () => {
      await manageQuantityModule.navigateToSwitchboard(PROJECT_NAME, SWITCHBOARD_NAME);
      await manageQuantityModule.addRootProductWithQuantity(ROOT_PRODUCT, 2);
    });

    await test.step('Navigate to SLD page', async () => {
      await manageQuantityModule.navigateToSLDPage();
    });

    await test.step('Verify SLD shows correct count of 2 for the root product', async () => {
      await manageQuantityModule.verifySLDRootProductCount(ROOT_PRODUCT, 2);
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TC-006  P1 | Core — Root product qty=1 hides quantity badge
  // ────────────────────────────────────────────────────────────────────────────
  test('TC-006: Root product with qty=1 — quantity badge is hidden on card', async ({
    manageQuantityModule,
  }) => {
    await test.step('Navigate to workbench', async () => {
      await manageQuantityModule.navigateToSwitchboard(PROJECT_NAME, SWITCHBOARD_NAME);
    });

    await test.step('Add root product and set quantity to 1', async () => {
      await manageQuantityModule.addRootProductWithQuantity(ROOT_PRODUCT, 1);
    });

    await test.step('Verify the quantity badge is hidden when qty=1', async () => {
      await manageQuantityModule.verifyRootQtyBoxHiddenAtOne(ROOT_PRODUCT);
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TC-007  P1 | Core — Branch product count shown in SLD
  // ────────────────────────────────────────────────────────────────────────────
  test('TC-007: Branch product with qty 3 — SLD shows count of 3 on branch node', async ({
    manageQuantityModule,
  }) => {
    await test.step('Navigate to workbench and add root + branch product', async () => {
      await manageQuantityModule.navigateToSwitchboard(PROJECT_NAME, SWITCHBOARD_NAME);
      await manageQuantityModule.addRootProductWithQuantity(ROOT_PRODUCT, 1);
      await manageQuantityModule.addBranchProductWithQuantity(BRANCH_PRODUCT, 3);
    });

    await test.step('Navigate to SLD page', async () => {
      await manageQuantityModule.navigateToSLDPage();
    });

    await test.step('Verify SLD shows count of 3 for the branch product', async () => {
      await manageQuantityModule.verifySLDBranchProductCount(BRANCH_PRODUCT, 3);
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TC-008  P1 | Core — Increment root qty via + button
  // ────────────────────────────────────────────────────────────────────────────
  test('TC-008: Increment root product quantity via + button — qty increases by 1', async ({
    manageQuantityModule,
  }) => {
    await test.step('Navigate to workbench and add root product with qty 2', async () => {
      await manageQuantityModule.navigateToSwitchboard(PROJECT_NAME, SWITCHBOARD_NAME);
      await manageQuantityModule.addRootProductWithQuantity(ROOT_PRODUCT, 2);
    });

    await test.step('Click the + increment button and verify qty is 3', async () => {
      await manageQuantityModule.incrementRootQtyAndVerify(ROOT_PRODUCT, 3);
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TC-009  P1 | Core — Decrement root qty via − button
  // ────────────────────────────────────────────────────────────────────────────
  test('TC-009: Decrement root product quantity via − button — qty decreases by 1', async ({
    manageQuantityModule,
  }) => {
    await test.step('Navigate to workbench and add root product with qty 3', async () => {
      await manageQuantityModule.navigateToSwitchboard(PROJECT_NAME, SWITCHBOARD_NAME);
      await manageQuantityModule.addRootProductWithQuantity(ROOT_PRODUCT, 3);
    });

    await test.step('Click the − decrement button and verify qty is 2', async () => {
      await manageQuantityModule.decrementRootQtyAndVerify(ROOT_PRODUCT, 2);
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TC-010  P1 | Core — Root qty typed directly into input
  // ────────────────────────────────────────────────────────────────────────────
  test('TC-010: Directly type quantity into root product input — value is accepted', async ({
    workbenchPage,
    manageQuantityModule,
  }) => {
    await test.step('Navigate to workbench and add root product', async () => {
      await manageQuantityModule.navigateToSwitchboard(PROJECT_NAME, SWITCHBOARD_NAME);
      await manageQuantityModule.addRootProductWithQuantity(ROOT_PRODUCT, 1);
    });

    await test.step('Type quantity 5 directly into the input', async () => {
      await workbenchPage.setRootProductQuantity(ROOT_PRODUCT, 5);
    });

    await test.step('Verify quantity input shows 5', async () => {
      await manageQuantityModule.verifyRootProductQtyValue(ROOT_PRODUCT, 5);
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TC-011  P1 | Core — SLD reflects updated root qty after increment
  // ────────────────────────────────────────────────────────────────────────────
  test('TC-011: After incrementing root qty on workbench — SLD count updates accordingly', async ({
    manageQuantityModule,
  }) => {
    await test.step('Add root product with qty 2, then increment to 3', async () => {
      await manageQuantityModule.navigateToSwitchboard(PROJECT_NAME, SWITCHBOARD_NAME);
      await manageQuantityModule.addRootProductWithQuantity(ROOT_PRODUCT, 2);
      await manageQuantityModule.incrementRootQtyAndVerify(ROOT_PRODUCT, 3);
    });

    await test.step('Navigate to SLD page', async () => {
      await manageQuantityModule.navigateToSLDPage();
    });

    await test.step('Verify SLD count for root product is now 3', async () => {
      await manageQuantityModule.verifySLDRootProductCount(ROOT_PRODUCT, 3);
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TC-012  P1 | Core — Bulk export with SLD checkbox checked
  // ────────────────────────────────────────────────────────────────────────────
  test('TC-012: Bulk export with SLD checkbox ticked — export succeeds and download starts', async ({
    exportPage,
    manageQuantityModule,
  }) => {
    await test.step('Navigate to workbench and configure products', async () => {
      await manageQuantityModule.navigateToSwitchboard(PROJECT_NAME, SWITCHBOARD_NAME);
      await manageQuantityModule.addRootProductWithQuantity(ROOT_PRODUCT, 2);
    });

    await test.step('Navigate to the Export page', async () => {
      await manageQuantityModule.navigateToExportPage();
      await expect(exportPage.exportPageHeading()).toBeVisible();
    });

    await test.step('Tick SLD checkbox and trigger bulk export', async () => {
      const download = await manageQuantityModule.performBulkExportWithSLD();
      await manageQuantityModule.verifyBulkExportSuccess(download);
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TC-013  P1 | Core — Category SLD export (raw SLD)
  // ────────────────────────────────────────────────────────────────────────────
  test('TC-013: Category SLD export — raw SLD file is downloaded successfully', async ({
    exportPage,
    manageQuantityModule,
  }) => {
    await test.step('Navigate to workbench and add products', async () => {
      await manageQuantityModule.navigateToSwitchboard(PROJECT_NAME, SWITCHBOARD_NAME);
      await manageQuantityModule.addRootProductWithQuantity(ROOT_PRODUCT, 2);
    });

    await test.step('Navigate to the Export page', async () => {
      await manageQuantityModule.navigateToExportPage();
      await expect(exportPage.exportPageHeading()).toBeVisible();
    });

    await test.step('Perform category SLD export and verify download', async () => {
      const download = await manageQuantityModule.performCategorySLDExport();
      await manageQuantityModule.verifyCategoryExportSuccess(download);
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TC-014  P1 | Core — Increment branch qty; SLD reflects new count
  // ────────────────────────────────────────────────────────────────────────────
  test('TC-014: After incrementing branch product qty — SLD branch node shows updated count', async ({
    manageQuantityModule,
  }) => {
    await test.step('Add root and branch products; increment branch qty from 2 to 3', async () => {
      await manageQuantityModule.navigateToSwitchboard(PROJECT_NAME, SWITCHBOARD_NAME);
      await manageQuantityModule.addRootProductWithQuantity(ROOT_PRODUCT, 1);
      await manageQuantityModule.addBranchProductWithQuantity(BRANCH_PRODUCT, 2);
      await manageQuantityModule.incrementBranchQtyAndVerify(BRANCH_PRODUCT, 3);
    });

    await test.step('Navigate to SLD page', async () => {
      await manageQuantityModule.navigateToSLDPage();
    });

    await test.step('Verify SLD branch count is 3', async () => {
      await manageQuantityModule.verifySLDBranchProductCount(BRANCH_PRODUCT, 3);
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TC-015  P1 | Core — Exported bulk file is not empty
  // ────────────────────────────────────────────────────────────────────────────
  test('TC-015: Exported bulk SLD file is a valid non-empty file', async ({
    manageQuantityModule,
  }) => {
    await test.step('Configure workbench with root product qty 2', async () => {
      await manageQuantityModule.navigateToSwitchboard(PROJECT_NAME, SWITCHBOARD_NAME);
      await manageQuantityModule.addRootProductWithQuantity(ROOT_PRODUCT, 2);
    });

    await test.step('Navigate to export and perform bulk export with SLD', async () => {
      await manageQuantityModule.navigateToExportPage();
    });

    await test.step('Verify downloaded file path is non-null', async () => {
      const download = await manageQuantityModule.performBulkExportWithSLD();
      await manageQuantityModule.verifyExportedFileIsNotEmpty(download);
    });
  });

});
