/**
 * Manage Quantity - SLD (OPT1-5608)
 * Spec file 2 of 2: TC-016 – TC-028
 * Priority coverage: P1 (remaining core) + P2 (edge cases)
 *
 * Prerequisites: same as spec file 1 (auth session via auth.setup.ts).
 *
 * ⚠️  NOTE: All page locators are best-effort inferences (app is behind Akamai
 *     IP whitelist). Run the locator extraction script on a whitelisted network
 *     and replace all `// TODO: verify selector` comments before production use.
 *
 * TC-023, TC-025 require knowledge of the exported SLD file format
 * (SVG / XML / PDF). These tests are skipped pending format confirmation.
 */

import { test, expect } from '@fixtures';
import { config } from '@config/index';

// ── Test data ─────────────────────────────────────────────────────────────────
const PROJECT_NAME     = 'Test Project';       // TODO: replace with actual project name in test environment
const SWITCHBOARD_NAME = 'Test Switchboard';   // TODO: replace with actual switchboard name in test environment
const ROOT_PRODUCT     = 'Busbar';
const BRANCH_PRODUCT   = 'Circuit Breaker';

// ── Describe block ────────────────────────────────────────────────────────────

test.describe(`@P1 @P2 @ManageQuantity Manage Quantity - SLD Edge Cases — ${config.displayName} [${config.environment}]`, () => {

  // ────────────────────────────────────────────────────────────────────────────
  // TC-016  P1 | Core — SLD page heading is present
  // ────────────────────────────────────────────────────────────────────────────
  test('TC-016: SLD page displays correct page heading', async ({
    sldPage,
    manageQuantityModule,
  }) => {
    await test.step('Navigate to workbench and go to SLD', async () => {
      await manageQuantityModule.navigateToSwitchboard(PROJECT_NAME, SWITCHBOARD_NAME);
      await manageQuantityModule.addRootProductWithQuantity(ROOT_PRODUCT, 2);
      await manageQuantityModule.navigateToSLDPage();
    });

    await test.step('Verify SLD page heading is visible', async () => {
      await expect(sldPage.sldPageHeading()).toBeVisible();
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TC-017  P1 | Core — Both root and branch products visible in SLD
  // ────────────────────────────────────────────────────────────────────────────
  test('TC-017: SLD shows both root and branch product nodes when both are added', async ({
    sldPage,
    manageQuantityModule,
  }) => {
    await test.step('Add both root and branch products to workbench', async () => {
      await manageQuantityModule.navigateToSwitchboard(PROJECT_NAME, SWITCHBOARD_NAME);
      await manageQuantityModule.addRootProductWithQuantity(ROOT_PRODUCT, 2);
      await manageQuantityModule.addBranchProductWithQuantity(BRANCH_PRODUCT, 2);
    });

    await test.step('Navigate to SLD page', async () => {
      await manageQuantityModule.navigateToSLDPage();
    });

    await test.step('Verify both product nodes are visible in the SLD', async () => {
      await expect(sldPage.rootProductNode(ROOT_PRODUCT)).toBeVisible();
      await expect(sldPage.branchProductNode(BRANCH_PRODUCT)).toBeVisible();
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TC-018  P1 | Core — SLD count label for root product with qty 4
  // ────────────────────────────────────────────────────────────────────────────
  test('TC-018: Root product with qty 4 — SLD count label shows 4', async ({
    manageQuantityModule,
  }) => {
    await test.step('Set root product qty to 4 and navigate to SLD', async () => {
      await manageQuantityModule.navigateToSwitchboard(PROJECT_NAME, SWITCHBOARD_NAME);
      await manageQuantityModule.addRootProductWithQuantity(ROOT_PRODUCT, 4);
      await manageQuantityModule.navigateToSLDPage();
    });

    await test.step('Verify SLD count label shows 4 for root product', async () => {
      await manageQuantityModule.verifySLDRootProductCount(ROOT_PRODUCT, 4);
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TC-019  P1 | Core — SLD count label for branch product with qty 5
  // ────────────────────────────────────────────────────────────────────────────
  test('TC-019: Branch product with qty 5 — SLD count label shows 5', async ({
    manageQuantityModule,
  }) => {
    await test.step('Add root product, set branch product qty to 5, navigate to SLD', async () => {
      await manageQuantityModule.navigateToSwitchboard(PROJECT_NAME, SWITCHBOARD_NAME);
      await manageQuantityModule.addRootProductWithQuantity(ROOT_PRODUCT, 1);
      await manageQuantityModule.addBranchProductWithQuantity(BRANCH_PRODUCT, 5);
      await manageQuantityModule.navigateToSLDPage();
    });

    await test.step('Verify SLD count label shows 5 for branch product', async () => {
      await manageQuantityModule.verifySLDBranchProductCount(BRANCH_PRODUCT, 5);
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TC-020  P1 | Core — Bulk export SLD checkbox is unchecked by default
  // ────────────────────────────────────────────────────────────────────────────
  test('TC-020: Export page — SLD checkbox is unchecked by default on load', async ({
    exportPage,
    manageQuantityModule,
  }) => {
    await test.step('Navigate to workbench and then export page', async () => {
      await manageQuantityModule.navigateToSwitchboard(PROJECT_NAME, SWITCHBOARD_NAME);
      await manageQuantityModule.navigateToExportPage();
    });

    await test.step('Verify SLD checkbox is unchecked by default', async () => {
      await expect(exportPage.bulkExportSldCheckbox()).not.toBeChecked();
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TC-021  P1 | Core — Bulk export without SLD checkbox proceeds
  // ────────────────────────────────────────────────────────────────────────────
  test('TC-021: Bulk export without SLD checkbox ticked — export proceeds without SLD', async ({
    exportPage,
    manageQuantityModule,
  }) => {
    await test.step('Navigate to workbench and add products', async () => {
      await manageQuantityModule.navigateToSwitchboard(PROJECT_NAME, SWITCHBOARD_NAME);
      await manageQuantityModule.addRootProductWithQuantity(ROOT_PRODUCT, 1);
    });

    await test.step('Navigate to export page and confirm SLD is unchecked', async () => {
      await manageQuantityModule.navigateToExportPage();
      await manageQuantityModule.verifyBulkExportSldCheckboxUnchecked();
    });

    await test.step('Trigger bulk export without SLD and verify download starts', async () => {
      const download = await exportPage.clickBulkExport();
      expect(download.suggestedFilename()).toBeTruthy();
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TC-022  P1 | Core — Decrement branch qty; SLD reflects reduced count
  // ────────────────────────────────────────────────────────────────────────────
  test('TC-022: Decrement branch product qty — SLD count decreases accordingly', async ({
    manageQuantityModule,
  }) => {
    await test.step('Add branch product with qty 3, then decrement to 2', async () => {
      await manageQuantityModule.navigateToSwitchboard(PROJECT_NAME, SWITCHBOARD_NAME);
      await manageQuantityModule.addRootProductWithQuantity(ROOT_PRODUCT, 1);
      await manageQuantityModule.addBranchProductWithQuantity(BRANCH_PRODUCT, 3);
      await manageQuantityModule.decrementBranchQtyAndVerify(BRANCH_PRODUCT, 2);
    });

    await test.step('Navigate to SLD and verify count is 2', async () => {
      await manageQuantityModule.navigateToSLDPage();
      await manageQuantityModule.verifySLDBranchProductCount(BRANCH_PRODUCT, 2);
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TC-023  P2 | Edge — Bulk exported file has expected SLD file extension
  // Blocked: requires confirmation of SLD export file format (SVG / XML / PDF)
  // ────────────────────────────────────────────────────────────────────────────
  test('TC-023: Bulk exported SLD file has the expected file extension', async ({
    manageQuantityModule,
  }) => {
    test.skip(true, 'Blocked: SLD export file format (SVG/XML/PDF) not yet confirmed — update expected extension regex before enabling');

    await test.step('Configure workbench and perform bulk export with SLD', async () => {
      await manageQuantityModule.navigateToSwitchboard(PROJECT_NAME, SWITCHBOARD_NAME);
      await manageQuantityModule.addRootProductWithQuantity(ROOT_PRODUCT, 2);
      await manageQuantityModule.navigateToExportPage();
      const download = await manageQuantityModule.performBulkExportWithSLD();

      await test.step('Verify file extension matches expected SLD format', async () => {
        const filename = download.suggestedFilename();
        expect(filename).toMatch(/\.(svg|xml|pdf|zip)$/i); // TODO: narrow to confirmed format
      });
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TC-024  P2 | Edge — Category SLD exported file is not empty
  // ────────────────────────────────────────────────────────────────────────────
  test('TC-024: Category SLD exported file is a valid non-empty file', async ({
    manageQuantityModule,
  }) => {
    await test.step('Configure workbench and navigate to export page', async () => {
      await manageQuantityModule.navigateToSwitchboard(PROJECT_NAME, SWITCHBOARD_NAME);
      await manageQuantityModule.addRootProductWithQuantity(ROOT_PRODUCT, 2);
      await manageQuantityModule.navigateToExportPage();
    });

    await test.step('Perform category SLD export and verify file is non-empty', async () => {
      const download = await manageQuantityModule.performCategorySLDExport();
      await manageQuantityModule.verifyExportedFileIsNotEmpty(download);
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TC-025  P2 | Edge — Category SLD exported file has expected extension
  // Blocked: requires confirmation of SLD export file format
  // ────────────────────────────────────────────────────────────────────────────
  test('TC-025: Category SLD exported file has the expected file extension', async ({
    manageQuantityModule,
  }) => {
    test.skip(true, 'Blocked: SLD export file format (SVG/XML/PDF) not yet confirmed — update expected extension regex before enabling');

    await test.step('Configure workbench and export category SLD', async () => {
      await manageQuantityModule.navigateToSwitchboard(PROJECT_NAME, SWITCHBOARD_NAME);
      await manageQuantityModule.addRootProductWithQuantity(ROOT_PRODUCT, 2);
      await manageQuantityModule.navigateToExportPage();
      const download = await manageQuantityModule.performCategorySLDExport();

      await test.step('Verify file extension', async () => {
        const filename = download.suggestedFilename();
        expect(filename).toMatch(/\.(svg|xml|pdf)$/i); // TODO: narrow to confirmed format
      });
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TC-026  P2 | Edge — SLD count label hidden for qty=1
  // ────────────────────────────────────────────────────────────────────────────
  test('TC-026: Root product with qty=1 — SLD does not show a count label', async ({
    sldPage,
    manageQuantityModule,
  }) => {
    await test.step('Add root product with qty=1 and navigate to SLD', async () => {
      await manageQuantityModule.navigateToSwitchboard(PROJECT_NAME, SWITCHBOARD_NAME);
      await manageQuantityModule.addRootProductWithQuantity(ROOT_PRODUCT, 1);
      await manageQuantityModule.navigateToSLDPage();
    });

    await test.step('Verify root product node is visible in SLD', async () => {
      await expect(sldPage.rootProductNode(ROOT_PRODUCT)).toBeVisible();
    });

    await test.step('Verify count label is not visible for qty=1', async () => {
      await expect(sldPage.rootProductCountLabel(ROOT_PRODUCT)).not.toBeVisible();
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TC-027  P2 | Edge — SLD is empty when no products on workbench
  // ────────────────────────────────────────────────────────────────────────────
  test('TC-027: SLD page with no products on workbench — no product nodes are displayed', async ({
    sldPage,
    manageQuantityModule,
  }) => {
    await test.step('Navigate to the SLD page without adding any products', async () => {
      await manageQuantityModule.navigateToSwitchboard(PROJECT_NAME, SWITCHBOARD_NAME);
      await manageQuantityModule.navigateToSLDPage();
    });

    await test.step('Verify the SLD diagram container is present', async () => {
      await expect(sldPage.diagramContainer()).toBeVisible();
    });

    await test.step('Verify no product nodes are displayed', async () => {
      const nodeCount = await sldPage.countVisibleNodes();
      expect(nodeCount).toBe(0);
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TC-028  P2 | Edge — Bulk export button remains enabled after SLD checkbox tick
  // ────────────────────────────────────────────────────────────────────────────
  test('TC-028: Bulk export button remains enabled after ticking SLD checkbox', async ({
    exportPage,
    manageQuantityModule,
  }) => {
    await test.step('Navigate to export page', async () => {
      await manageQuantityModule.navigateToSwitchboard(PROJECT_NAME, SWITCHBOARD_NAME);
      await manageQuantityModule.navigateToExportPage();
    });

    await test.step('Tick the SLD checkbox', async () => {
      await exportPage.tickBulkExportSld();
      await expect(exportPage.bulkExportSldCheckbox()).toBeChecked();
    });

    await test.step('Verify the export button is enabled', async () => {
      await expect(exportPage.bulkExportBtn()).toBeEnabled();
    });
  });

});
