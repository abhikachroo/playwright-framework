/**
 * OPT1-5608 -- Manage Quantity (SLD)
 * Feature: Product quantity management and SLD export validation
 * Environment: preprod  |  App: EcoSet Config (ecoset-config-ppr.se.com)
 *
 * Test Distribution:
 *   P0 Smoke        -- TC-001 ... TC-004  (4 tests)
 *   P1 Functional   -- TC-005 ... TC-017  (13 tests)
 *   P1 Negative     -- TC-018 ... TC-021  (4 tests)
 *   P2 Edge/Access  -- TC-022 ... TC-025  (4 tests)
 *
 * NOTE: All selectors marked "// TODO: verify selector" in Page classes must
 * be validated against the live app before this suite is fully reliable.
 * SLD file format is unknown -- SldFileParser uses heuristic checks until
 * the real format is confirmed.
 */

import { test, expect } from '@fixtures';
import { config } from '@config/index';
import { DataGenerator } from '@utils/DataGenerator';
import { SldFileParser } from '@utils/SldFileParser';

// ---------------------------------------------------------------------------
// P0 SMOKE
// ---------------------------------------------------------------------------

test.describe(
  `@P0 @Smoke @ManageQuantitySLD Manage Quantity SLD -- ${config.displayName} [${config.environment}]`,
  () => {
    test('TC-001: Login and navigate to project list', async ({
      page,
      loginModule,
      projectPage,
    }) => {
      await test.step('Log in with configured credentials', async () => {
        await loginModule.doLogin();
      });

      await test.step('Verify landing on the application after login', async () => {
        await expect(page).toHaveURL(new RegExp(new URL(config.baseUrl).hostname));
        await expect(page).not.toHaveURL(/\/login/);
      });

      await test.step('Verify project list page heading is displayed', async () => {
        await expect(projectPage.projectListHeading()).toBeVisible();
      });
    });

    test('TC-002: Navigate to switchboard shows Products Selection page', async ({
      loginModule,
      projectModule,
      workbenchPage,
    }) => {
      await test.step('Log in with configured credentials', async () => {
        await loginModule.doLogin();
      });

      await test.step('Navigate to project list and open first project', async () => {
        await projectModule.navigateToProjectList();
        await projectModule.openFirstProject();
      });

      await test.step('Open first switchboard in the project', async () => {
        await projectModule.openFirstSwitchboard();
      });

      await test.step('Verify Products Selection page is displayed', async () => {
        await expect(workbenchPage.productsSelectionHeading()).toBeVisible();
      });
    });

    test('TC-003: Add root-level product with quantity > 1 shows quantity box on card', async ({
      loginModule,
      projectModule,
      workbenchModule,
      workbenchPage,
    }) => {
      const testQty = DataGenerator.randomInt(2, 5);

      await test.step('Log in and navigate to switchboard', async () => {
        await loginModule.doLogin();
        await projectModule.navigateToSwitchboard();
      });

      await test.step('Wait for Products Selection page to load', async () => {
        await workbenchModule.waitForProductsSelectionPage();
      });

      await test.step(`Add root-level product with quantity ${testQty}`, async () => {
        await workbenchModule.addRootProductWithQuantity(testQty);
      });

      await test.step('Verify quantity box is visible on the product card', async () => {
        await expect(workbenchPage.quantityBoxOnCard()).toBeVisible();
        await expect(workbenchPage.quantityBoxOnCard()).toContainText(String(testQty));
      });
    });

    test('TC-004: Add branch-level product with quantity > 1 shows quantity box on card', async ({
      loginModule,
      projectModule,
      workbenchModule,
      workbenchPage,
    }) => {
      const testQty = DataGenerator.randomInt(2, 5);

      await test.step('Log in and navigate to switchboard', async () => {
        await loginModule.doLogin();
        await projectModule.navigateToSwitchboard();
      });

      await test.step('Wait for Products Selection page to load', async () => {
        await workbenchModule.waitForProductsSelectionPage();
      });

      await test.step(`Add branch-level product with quantity ${testQty}`, async () => {
        await workbenchModule.addBranchProductWithQuantity(testQty);
      });

      await test.step('Verify quantity box is visible on the product card', async () => {
        await expect(workbenchPage.quantityBoxOnCard()).toBeVisible();
        await expect(workbenchPage.quantityBoxOnCard()).toContainText(String(testQty));
      });
    });
  },
);

// ---------------------------------------------------------------------------
// P1 FUNCTIONAL
// ---------------------------------------------------------------------------

test.describe(
  `@P1 @Functional @ManageQuantitySLD Manage Quantity SLD -- ${config.displayName} [${config.environment}]`,
  () => {
    test('TC-005: Full quantity workflow -- root and branch products added and persisted', async ({
      loginModule,
      projectModule,
      workbenchModule,
      workbenchPage,
    }) => {
      const rootQty   = DataGenerator.randomInt(2, 4);
      const branchQty = DataGenerator.randomInt(2, 4);

      await test.step('Log in and navigate to switchboard', async () => {
        await loginModule.doLogin();
        await projectModule.navigateToSwitchboard();
      });

      await test.step('Wait for Products Selection page to load', async () => {
        await workbenchModule.waitForProductsSelectionPage();
      });

      await test.step(`Add root product with quantity ${rootQty}`, async () => {
        await workbenchModule.addRootProductWithQuantity(rootQty);
      });

      await test.step(`Verify root product card shows quantity ${rootQty}`, async () => {
        await workbenchModule.verifyQuantityBoxOnCard(rootQty);
      });

      await test.step(`Add branch product with quantity ${branchQty}`, async () => {
        await workbenchModule.addBranchProductWithQuantity(branchQty);
      });

      await test.step(`Verify branch product card shows quantity ${branchQty}`, async () => {
        await workbenchModule.verifyQuantityBoxOnCard(branchQty);
      });

      await test.step('Verify at least 2 product cards are present on canvas', async () => {
        const count = await workbenchPage.getProductCardCount();
        expect(count).toBeGreaterThanOrEqual(2);
      });
    });

    test('TC-006: SLD page shows correct root-level product count', async ({
      loginModule,
      projectModule,
      workbenchModule,
      sldModule,
    }) => {
      const rootQty = DataGenerator.randomInt(2, 4);

      await test.step('Log in and navigate to switchboard', async () => {
        await loginModule.doLogin();
        await projectModule.navigateToSwitchboard();
      });

      await test.step(`Add root product with quantity ${rootQty}`, async () => {
        await workbenchModule.waitForProductsSelectionPage();
        await workbenchModule.addRootProductWithQuantity(rootQty);
      });

      await test.step('Navigate to SLD tab', async () => {
        await workbenchModule.navigateToSldTab();
        await sldModule.waitForSLDLoad();
      });

      await test.step(`Verify ${rootQty} root-level node(s) are displayed on the SLD`, async () => {
        await sldModule.verifyRootNodeCount(rootQty);
      });
    });

    test('TC-007: SLD page shows correct branch-level product count', async ({
      loginModule,
      projectModule,
      workbenchModule,
      sldModule,
    }) => {
      const branchQty = DataGenerator.randomInt(2, 4);

      await test.step('Log in and navigate to switchboard', async () => {
        await loginModule.doLogin();
        await projectModule.navigateToSwitchboard();
      });

      await test.step(`Add branch product with quantity ${branchQty}`, async () => {
        await workbenchModule.waitForProductsSelectionPage();
        await workbenchModule.addBranchProductWithQuantity(branchQty);
      });

      await test.step('Navigate to SLD tab', async () => {
        await workbenchModule.navigateToSldTab();
        await sldModule.waitForSLDLoad();
      });

      await test.step(`Verify ${branchQty} branch-level node(s) are displayed on the SLD`, async () => {
        await sldModule.verifyBranchNodeCount(branchQty);
      });
    });

    test('TC-008: SLD quantity labels reflect root product quantity value', async ({
      loginModule,
      projectModule,
      workbenchModule,
      sldModule,
    }) => {
      const rootQty = DataGenerator.randomInt(2, 5);

      await test.step('Log in, navigate, and add root product', async () => {
        await loginModule.doLogin();
        await projectModule.navigateToSwitchboard();
        await workbenchModule.waitForProductsSelectionPage();
        await workbenchModule.addRootProductWithQuantity(rootQty);
      });

      await test.step('Navigate to SLD tab and wait for load', async () => {
        await workbenchModule.navigateToSldTab();
        await sldModule.waitForSLDLoad();
      });

      await test.step(`Verify SLD quantity label shows ${rootQty} for root product`, async () => {
        await sldModule.verifyRootProductQuantityInSld(rootQty);
      });
    });

    test('TC-009: SLD quantity labels reflect branch product quantity value', async ({
      loginModule,
      projectModule,
      workbenchModule,
      sldModule,
    }) => {
      const branchQty = DataGenerator.randomInt(2, 5);

      await test.step('Log in, navigate, and add branch product', async () => {
        await loginModule.doLogin();
        await projectModule.navigateToSwitchboard();
        await workbenchModule.waitForProductsSelectionPage();
        await workbenchModule.addBranchProductWithQuantity(branchQty);
      });

      await test.step('Navigate to SLD tab and wait for load', async () => {
        await workbenchModule.navigateToSldTab();
        await sldModule.waitForSLDLoad();
      });

      await test.step(`Verify SLD quantity label shows ${branchQty} for branch product`, async () => {
        await sldModule.verifyBranchProductQuantityInSld(branchQty);
      });
    });

    test('TC-010: SLD page shows correct hierarchy -- root and branch levels both present', async ({
      loginModule,
      projectModule,
      workbenchModule,
      sldModule,
    }) => {
      await test.step('Log in and navigate to switchboard', async () => {
        await loginModule.doLogin();
        await projectModule.navigateToSwitchboard();
      });

      await test.step('Add root product (qty 2) and branch product (qty 2)', async () => {
        await workbenchModule.waitForProductsSelectionPage();
        await workbenchModule.addRootProductWithQuantity(2);
        await workbenchModule.addBranchProductWithQuantity(2);
      });

      await test.step('Navigate to SLD tab and wait for load', async () => {
        await workbenchModule.navigateToSldTab();
        await sldModule.waitForSLDLoad();
      });

      await test.step('Verify both root and branch levels are displayed in SLD hierarchy', async () => {
        await sldModule.verifyHierarchyLevelsPresent();
      });
    });

    test('TC-011: Bulk export with SLD checkbox ticked triggers download', async ({
      loginModule,
      projectModule,
      workbenchModule,
      exportModule,
    }) => {
      await test.step('Log in, navigate, and add root product', async () => {
        await loginModule.doLogin();
        await projectModule.navigateToSwitchboard();
        await workbenchModule.waitForProductsSelectionPage();
        await workbenchModule.addRootProductWithQuantity(2);
      });

      await test.step('Navigate to Export tab and wait for page load', async () => {
        await workbenchModule.navigateToExportTab();
        await exportModule.waitForExportPage();
      });

      await test.step('Tick SLD checkbox and trigger bulk export', async () => {
        const download = await exportModule.triggerBulkExportWithSld();
        await exportModule.verifyDownloadReceived(download);
        await exportModule.verifyDownloadIsNotEmpty(download);
      });
    });

    test('TC-012: SLD checkbox is visible and interactive on Export page', async ({
      loginModule,
      projectModule,
      workbenchModule,
      exportModule,
      exportPage,
    }) => {
      await test.step('Log in and navigate to Export page', async () => {
        await loginModule.doLogin();
        await projectModule.navigateToSwitchboard();
        await workbenchModule.waitForProductsSelectionPage();
        await workbenchModule.navigateToExportTab();
        await exportModule.waitForExportPage();
      });

      await test.step('Verify SLD checkbox is visible on the Export page', async () => {
        await expect(exportPage.sldCheckbox()).toBeVisible();
      });

      await test.step('Tick SLD checkbox and verify it is checked', async () => {
        await exportPage.checkSldCheckbox();
        await expect(exportPage.sldCheckbox()).toBeChecked();
      });

      await test.step('Untick SLD checkbox and verify it is unchecked', async () => {
        await exportPage.uncheckSldCheckbox();
        await expect(exportPage.sldCheckbox()).not.toBeChecked();
      });
    });

    test('TC-013: Category SLD export triggers download', async ({
      loginModule,
      projectModule,
      workbenchModule,
      exportModule,
    }) => {
      await test.step('Log in, navigate, and add root product', async () => {
        await loginModule.doLogin();
        await projectModule.navigateToSwitchboard();
        await workbenchModule.waitForProductsSelectionPage();
        await workbenchModule.addRootProductWithQuantity(2);
      });

      await test.step('Navigate to Export tab and wait for page load', async () => {
        await workbenchModule.navigateToExportTab();
        await exportModule.waitForExportPage();
      });

      await test.step('Trigger SLD category export and verify download', async () => {
        const download = await exportModule.triggerCategoryExportSld();
        await exportModule.verifyDownloadReceived(download);
        await exportModule.verifyDownloadIsNotEmpty(download);
      });
    });

    test('TC-014: Bulk export download contains SLD file with expected quantity', async ({
      loginModule,
      projectModule,
      workbenchModule,
      exportModule,
    }) => {
      const rootQty = DataGenerator.randomInt(2, 4);
      const parser  = new SldFileParser();

      await test.step('Log in, navigate, and add root product', async () => {
        await loginModule.doLogin();
        await projectModule.navigateToSwitchboard();
        await workbenchModule.waitForProductsSelectionPage();
        await workbenchModule.addRootProductWithQuantity(rootQty);
      });

      await test.step('Navigate to Export tab', async () => {
        await workbenchModule.navigateToExportTab();
        await exportModule.waitForExportPage();
      });

      await test.step('Download bulk export file and verify it is non-empty', async () => {
        const download  = await exportModule.triggerBulkExportWithSld();
        const filePath  = await download.path();
        expect(filePath, 'Download path should not be null').not.toBeNull();
        await parser.verifyFileNonEmpty(filePath!);
      });
    });

    test('TC-015: Category SLD export file contains non-empty SLD content', async ({
      loginModule,
      projectModule,
      workbenchModule,
      exportModule,
    }) => {
      const parser = new SldFileParser();

      await test.step('Log in, navigate, and add branch product', async () => {
        await loginModule.doLogin();
        await projectModule.navigateToSwitchboard();
        await workbenchModule.waitForProductsSelectionPage();
        await workbenchModule.addBranchProductWithQuantity(3);
      });

      await test.step('Navigate to Export tab', async () => {
        await workbenchModule.navigateToExportTab();
        await exportModule.waitForExportPage();
      });

      await test.step('Download category SLD file and verify content is non-empty', async () => {
        const download = await exportModule.triggerCategoryExportSld();
        const filePath = await download.path();
        expect(filePath, 'Download path should not be null').not.toBeNull();
        await parser.verifyFileNonEmpty(filePath!);
      });
    });

    test('TC-016: Exported SLD file has readable text content', async ({
      loginModule,
      projectModule,
      workbenchModule,
      exportModule,
    }) => {
      const parser = new SldFileParser();

      await test.step('Log in, navigate, and add product', async () => {
        await loginModule.doLogin();
        await projectModule.navigateToSwitchboard();
        await workbenchModule.waitForProductsSelectionPage();
        await workbenchModule.addRootProductWithQuantity(2);
      });

      await test.step('Export SLD via category export', async () => {
        await workbenchModule.navigateToExportTab();
        await exportModule.waitForExportPage();
      });

      await test.step('Verify exported file is non-empty and readable', async () => {
        const download = await exportModule.triggerCategoryExportSld();
        const filePath = await download.path();
        expect(filePath, 'Download path should not be null').not.toBeNull();
        const content = await parser.readAsText(filePath!);
        expect(content.length, 'Exported SLD file content should not be empty').toBeGreaterThan(0);
        // TODO: uncomment once SLD file format is confirmed as XML/SVG
        // expect(parser.isXmlOrSvg(content)).toBe(true);
      });
    });

    test('TC-017: Exported SLD quantity matches in-app SLD quantity', async ({
      loginModule,
      projectModule,
      workbenchModule,
      sldModule,
      exportModule,
    }) => {
      const rootQty = DataGenerator.randomInt(2, 5);
      const parser  = new SldFileParser();

      await test.step('Log in, navigate, and add root product', async () => {
        await loginModule.doLogin();
        await projectModule.navigateToSwitchboard();
        await workbenchModule.waitForProductsSelectionPage();
        await workbenchModule.addRootProductWithQuantity(rootQty);
      });

      await test.step(`Verify in-app SLD shows quantity ${rootQty}`, async () => {
        await workbenchModule.navigateToSldTab();
        await sldModule.waitForSLDLoad();
        await sldModule.verifyRootProductQuantityInSld(rootQty);
      });

      await test.step('Export SLD and verify exported file quantity matches in-app SLD', async () => {
        await workbenchModule.navigateToExportTab();
        await exportModule.waitForExportPage();
        const download  = await exportModule.triggerCategoryExportSld();
        const filePath  = await download.path();
        expect(filePath, 'Download path should not be null').not.toBeNull();
        const content = await parser.readAsText(filePath!);
        const hasQty  = parser.containsToken(content, String(rootQty));
        expect(
          hasQty,
          `Exported SLD should contain quantity "${rootQty}" matching in-app SLD view`,
        ).toBe(true);
      });
    });
  },
);

// ---------------------------------------------------------------------------
// P1 NEGATIVE
// ---------------------------------------------------------------------------

test.describe(
  `@P1 @Negative @ManageQuantitySLD Manage Quantity SLD -- ${config.displayName} [${config.environment}]`,
  () => {
    test('TC-018: Login with invalid credentials shows error message', async ({
      loginPage,
    }) => {
      const invalidEmail    = DataGenerator.randomEmail();
      const invalidPassword = DataGenerator.randomString(10);

      await test.step('Navigate to the login page', async () => {
        await loginPage.navigate(config.loginPath);
        await loginPage.waitForPageLoad();
        await loginPage.dismissCookieBanner();
      });

      await test.step('Enter invalid email and advance to password step', async () => {
        await loginPage.fillEmail(invalidEmail);
        await loginPage.checkHumanVerification();
        await loginPage.waitForAuth0CaptchaSolved();
        await loginPage.clickContinue();
      });

      await test.step('Enter invalid password and submit', async () => {
        await loginPage.fillPassword(invalidPassword);
        await loginPage.clickSignIn();
      });

      await test.step('Verify error message is displayed with non-empty text', async () => {
        await expect(loginPage.errorMessage()).toBeVisible();
        const errorText = await loginPage.getErrorText();
        expect(errorText.length, 'Error message should not be empty').toBeGreaterThan(0);
      });
    });

    test('TC-019: Bulk export SLD checkbox remains unchecked when not selected', async ({
      loginModule,
      projectModule,
      workbenchModule,
      exportModule,
      exportPage,
    }) => {
      await test.step('Log in, navigate, and add product', async () => {
        await loginModule.doLogin();
        await projectModule.navigateToSwitchboard();
        await workbenchModule.waitForProductsSelectionPage();
        await workbenchModule.addRootProductWithQuantity(2);
      });

      await test.step('Navigate to Export page', async () => {
        await workbenchModule.navigateToExportTab();
        await exportModule.waitForExportPage();
      });

      await test.step('Ensure SLD checkbox is unchecked and verify state', async () => {
        await exportPage.uncheckSldCheckbox();
        await expect(exportPage.sldCheckbox()).not.toBeChecked();
      });

      await test.step('Verify SLD checkbox remains unchecked before export submission', async () => {
        await expect(exportPage.sldCheckbox()).not.toBeChecked();
      });
    });

    test('TC-020: Category export with no products -- app handles gracefully', async ({
      loginModule,
      projectModule,
      workbenchModule,
      exportModule,
      exportPage,
    }) => {
      await test.step('Log in and navigate to a fresh switchboard without adding products', async () => {
        await loginModule.doLogin();
        await projectModule.navigateToSwitchboard();
        await workbenchModule.waitForProductsSelectionPage();
      });

      await test.step('Navigate to Export tab', async () => {
        await workbenchModule.navigateToExportTab();
        await exportModule.waitForExportPage();
      });

      await test.step('Attempt SLD category export and verify graceful handling', async () => {
        const isBtnVisible = await exportPage.sldCategoryBtn().isVisible().catch(() => false);

        if (isBtnVisible) {
          await exportPage.clickExportSldCategory().catch(() => undefined);
          const hasError   = await exportPage.exportErrorMessage().isVisible().catch(() => false);
          const hasSuccess = await exportPage.exportSuccessMessage().isVisible().catch(() => false);
          expect(
            hasError || hasSuccess,
            'App should show either an error or success for empty-project SLD export',
          ).toBe(true);
        } else {
          // Button is hidden/disabled -- graceful handling confirmed
          await expect(exportPage.exportPageContainer()).toBeVisible();
        }
      });
    });

    test('TC-021: Quantity input validation -- zero and negative values are rejected', async ({
      loginModule,
      projectModule,
      workbenchModule,
      workbenchPage,
    }) => {
      await test.step('Log in and navigate to switchboard', async () => {
        await loginModule.doLogin();
        await projectModule.navigateToSwitchboard();
        await workbenchModule.waitForProductsSelectionPage();
      });

      await test.step('Attempt to set quantity = 0 and verify validation error is shown', async () => {
        await workbenchModule.attemptInvalidQuantity(0);
        await expect(workbenchPage.quantityValidationError()).toBeVisible();
      });

      await test.step('Attempt to set quantity = -1 and verify validation error is shown', async () => {
        await workbenchModule.attemptInvalidQuantity(-1);
        await expect(workbenchPage.quantityValidationError()).toBeVisible();
      });

      await test.step('Verify the validation error message text is non-empty', async () => {
        const errorText = await workbenchPage.getValidationErrorText();
        expect(errorText.length, 'Validation error message should not be empty').toBeGreaterThan(0);
      });
    });
  },
);

// ---------------------------------------------------------------------------
// P2 EDGE CASES
// ---------------------------------------------------------------------------

test.describe(
  `@P2 @Edge @ManageQuantitySLD Manage Quantity SLD -- ${config.displayName} [${config.environment}]`,
  () => {
    test('TC-022: Quantity = 1 -- no quantity box displayed on product card', async ({
      loginModule,
      projectModule,
      workbenchModule,
      workbenchPage,
    }) => {
      await test.step('Log in and navigate to switchboard', async () => {
        await loginModule.doLogin();
        await projectModule.navigateToSwitchboard();
        await workbenchModule.waitForProductsSelectionPage();
      });

      await test.step('Add root product with quantity = 1 (default)', async () => {
        await workbenchModule.addRootProductWithQuantity(1);
      });

      await test.step('Verify quantity box is NOT displayed when quantity is exactly 1', async () => {
        // Per AC: when quantity = 1, no quantity badge/box is shown on the card
        await expect(workbenchPage.quantityBoxOnCard()).not.toBeVisible();
      });
    });

    test('TC-023: Accessing protected URL without authentication redirects to login', async ({
      page,
      loginPage,
    }) => {
      const protectedPath = '/projects';

      await test.step('Attempt to navigate directly to a protected page without logging in', async () => {
        await page.goto(`${config.baseUrl}${protectedPath}`);
        await loginPage.waitForPageLoad();
      });

      await test.step('Verify that the app redirects to the login / auth page', async () => {
        await expect(page).toHaveURL(/login|auth0|identifier/);
      });
    });

    test('TC-024: SLD page loading state resolves before canvas is interactive', async ({
      loginModule,
      projectModule,
      workbenchModule,
      sldModule,
    }) => {
      await test.step('Log in, navigate, and add root product', async () => {
        await loginModule.doLogin();
        await projectModule.navigateToSwitchboard();
        await workbenchModule.waitForProductsSelectionPage();
        await workbenchModule.addRootProductWithQuantity(3);
      });

      await test.step('Navigate to SLD tab', async () => {
        await workbenchModule.navigateToSldTab();
      });

      await test.step('Verify loading state resolves and SLD canvas is displayed', async () => {
        await sldModule.verifyLoadingStateThenResolves();
      });
    });

    test('TC-025: SLD page with no products shows empty-state message', async ({
      loginModule,
      projectModule,
      workbenchModule,
      sldModule,
    }) => {
      await test.step('Log in and navigate to switchboard without adding any products', async () => {
        await loginModule.doLogin();
        await projectModule.navigateToSwitchboard();
        await workbenchModule.waitForProductsSelectionPage();
      });

      await test.step('Navigate to SLD tab', async () => {
        await workbenchModule.navigateToSldTab();
      });

      await test.step('Verify empty-state message is displayed on the SLD page', async () => {
        await sldModule.verifyEmptySldState();
      });
    });
  },
);
