import { Page } from '@playwright/test';
import { ProjectPage } from '@pages/ProjectPage';
import { Logger } from '@utils/Logger';
import { config } from '@config/index';

export class ProjectModule {
  private logger: Logger;

  constructor(
    private page: Page,
    private projectPage: ProjectPage,
  ) {
    this.logger = new Logger('ProjectModule');
  }

  /**
   * Navigate to the app root and wait for the project list to load.
   */
  async navigateToProjectList(): Promise<void> {
    this.logger.info(`[${config.environment}] Navigating to project list`);
    await this.projectPage.navigate('/');
    await this.projectPage.waitForPageLoad();
    await this.projectPage.projectListHeading().waitFor({ state: 'visible', timeout: 20_000 });
    this.logger.info('Project list loaded');
  }

  /**
   * Open the first available project in the list.
   */
  async openFirstProject(): Promise<void> {
    this.logger.info('Opening first available project');
    await this.projectPage.clickFirstProject();
    await this.projectPage.waitForPageLoad();
    this.logger.info(`Opened project: ${await this.projectPage.getProjectTitle()}`);
  }

  /**
   * Open a project by its display name.
   */
  async openProjectByName(name: string): Promise<void> {
    this.logger.info(`Opening project: ${name}`);
    await this.projectPage.clickProjectByName(name);
    await this.projectPage.waitForPageLoad();
  }

  /**
   * Navigate into the first switchboard listed within the current project.
   * Expects the user to already be on a project detail page.
   */
  async openFirstSwitchboard(): Promise<void> {
    this.logger.info('Navigating to first switchboard');
    await this.projectPage.clickFirstSwitchboard();
    await this.projectPage.waitForPageLoad();
    this.logger.info(`Now at: ${this.page.url()}`);
  }

  /**
   * Navigate to a switchboard by its display name.
   */
  async openSwitchboardByName(name: string): Promise<void> {
    this.logger.info(`Navigating to switchboard: ${name}`);
    await this.projectPage.clickSwitchboardByName(name);
    await this.projectPage.waitForPageLoad();
  }

  /**
   * Full flow: login is assumed done; navigates project list -> opens first
   * project -> opens first switchboard -> returns on the Products Selection page.
   */
  async navigateToSwitchboard(): Promise<void> {
    await this.navigateToProjectList();
    await this.openFirstProject();
    await this.openFirstSwitchboard();
  }
}
