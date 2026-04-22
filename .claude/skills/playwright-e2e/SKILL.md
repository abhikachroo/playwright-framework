---
name: playwright-e2e
description: Enterprise-grade Playwright test automation framework using 7-layer architecture with Page Object Model, Module Pattern, custom fixtures, API testing layer, structured logging, data generators, multi-browser support, file-based multi-environment (sint/preprod/prod) and multi-OPCO support via config.json per OPCO per environment.
version: 2.0.0
tags: [playwright, e2e, advanced, page-object-model, module-pattern, fixtures, api-testing, reporting, enterprise, framework, typescript, multi-browser, parallel-testing, multi-environment, multi-opco, config-json]
testingTypes: [e2e, api, visual, integration]
frameworks: [playwright]
languages: [typescript]
domains: [web, api]
agents: [claude-code, cursor, github-copilot, windsurf, codex, aider, continue, cline, zed, bolt, roo-code, augment, trae]
---

# Advanced Playwright E2E Framework

You are an expert QA automation architect specializing in enterprise-grade Playwright frameworks. You build scalable, maintainable test automation using a 7-layer architecture with Page Object Model (POM) and Module Pattern. You enforce strict separation of concerns: Pages handle locators only, Modules handle business logic, and Tests orchestrate workflows. You always use `test.step()` for reporting, custom fixtures for dependency injection, and structured logging instead of `console.log`.

The framework supports multiple **environments** (`sint`, `preprod`, `prod`) and multiple **OPCOs** (e.g. `AUTH_POC`, `FRA-CONNECT`, `USA-CRAWFRD`). Each combination has its own `config.json` file stored at `src/config/env/<environment>/<OPCO>/config.json`. The active combination is selected via `ENVIRONMENT` and `OPCO` in the `.env` file (local) or as pipeline env vars (CI). No credentials or URLs are hardcoded in TypeScript.

## Core Principles

1. **7-Layer Architecture** -- Configuration, Pages, Modules, Utilities, API Layer, Fixtures, and Test Specs. Each layer has a single responsibility and communicates only with adjacent layers.
2. **Pages are locator-only** -- Page classes define locators as arrow functions and expose simple UI actions (click, fill, navigate). No business logic, no conditionals, no assertions.
3. **Modules own business logic** -- Module classes orchestrate multiple Page actions into domain workflows (e.g., `doLogin()`, `completeCheckout()`). All conditional logic and multi-step flows live here.
4. **Fixtures for dependency injection** -- Custom Playwright fixtures provide pre-configured page objects, modules, and authenticated sessions. Tests never instantiate pages or modules directly.
5. **test.step() everywhere** -- Every meaningful action is wrapped in `test.step()` for clear HTML reporting, trace analysis, and debugging. No naked `await` sequences.
6. **File-based config, not TypeScript maps** -- Each OPCO×environment combination is a `config.json` file. Adding a new OPCO or environment means adding a folder and file — no TypeScript changes. `src/config/index.ts` is the only TypeScript in the config layer; it loads the right file at runtime.

## Test Execution Flow

```
Test Specs -> Fixtures -> Modules -> Pages -> Browser -> Reports
```

Tests import from fixtures, which provide Module and Page instances. Modules call Page methods. Pages interact with the browser. Reports capture every step.

## Project Structure

```
project-root/
├── playwright.config.ts          # Playwright configuration
├── tsconfig.json                 # TypeScript config with path aliases
├── .env                          # Active run selection (gitignored)
├── .env.example                  # Template showing required keys
├── package.json                  # Scripts and dependencies
│
├── src/
│   ├── config/                   # Layer 1: Configuration
│   │   ├── index.ts              # Config loader — only TS file in this layer
│   │   └── env/                  # One folder per environment
│   │       ├── sint/             # System Integration Test
│   │       │   ├── AUTH_POC/
│   │       │   │   └── config.json
│   │       │   ├── FRA-CONNECT/
│   │       │   │   └── config.json
│   │       │   └── USA-CRAWFRD/
│   │       │       └── config.json
│   │       ├── preprod/          # Pre-Production
│   │       │   ├── AUTH_POC/
│   │       │   │   └── config.json
│   │       │   ├── FRA-CONNECT/
│   │       │   │   └── config.json
│   │       │   └── USA-CRAWFRD/
│   │       │       └── config.json
│   │       └── prod/             # Production
│   │           ├── AUTH_POC/
│   │           │   └── config.json
│   │           ├── FRA-CONNECT/
│   │           │   └── config.json
│   │           └── USA-CRAWFRD/
│   │               └── config.json
│   │
│   ├── pages/                    # Layer 2: Locators & basic actions
│   │   ├── BasePage.ts           # Abstract base page
│   │   ├── LoginPage.ts
│   │   └── index.ts              # Barrel exports
│   │
│   ├── modules/                  # Layer 3: Business logic
│   │   ├── LoginModule.ts
│   │   └── index.ts
│   │
│   ├── utils/                    # Layer 4: Utilities
│   │   ├── Logger.ts
│   │   ├── WaitHelper.ts
│   │   ├── DataGenerator.ts
│   │   ├── ApiHelper.ts
│   │   └── index.ts
│   │
│   ├── api/                      # Layer 5: API testing
│   │   ├── AuthApi.ts
│   │   └── index.ts
│   │
│   ├── fixtures/                 # Layer 6: Custom fixtures
│   │   └── index.ts
│   │
│   ├── tests/                    # Layer 7: Test specifications
│   │   └── login.spec.ts
│   │
│   └── testdata/                 # Test data files
│       └── types.ts
│
├── playwright-report/            # Default Playwright reports
└── test-results/                 # JSON results & artifacts
```

---

## Layer 1: Configuration

The config layer has one TypeScript file (`index.ts`) and a folder tree of JSON files. **No TypeScript maps for environments or OPCOs.**

### Config folder convention

```
src/config/env/<environment>/<OPCO>/config.json
```

- `<environment>` — lowercase: `sint`, `preprod`, `prod`
- `<OPCO>` — exact folder name used as the OPCO key: `AUTH_POC`, `FRA-CONNECT`, `USA-CRAWFRD`

### `config.json` — shape (same for every OPCO×environment file)

```json
{
  "displayName": "Auth POC",
  "baseUrl": "https://sint.auth-poc.example.com",
  "apiUrl": "https://sint-api.auth-poc.example.com",
  "loginPath": "/login",
  "username": "test.user@example.com",
  "password": "s3cr3t"
}
```

All fields are required. Add any OPCO-specific test data fields here as needed (e.g. `"clientId"`, `"tenantId"`).

### `.env` — local run selection

```dotenv
# Selects: src/config/env/<ENVIRONMENT>/<OPCO>/config.json
ENVIRONMENT=sint
OPCO=AUTH_POC

LOG_LEVEL=INFO
```

`.env` is gitignored. `.env.example` is committed with the same keys but empty values.

### `.env.example`

```dotenv
# Selects: src/config/env/<ENVIRONMENT>/<OPCO>/config.json
# Valid ENVIRONMENT values: sint | preprod | prod
# Valid OPCO values: any folder name under src/config/env/<environment>/
ENVIRONMENT=
OPCO=

LOG_LEVEL=INFO
```

### `src/config/index.ts`

The only TypeScript in the config layer. Reads `ENVIRONMENT` and `OPCO`, resolves the path to the matching `config.json`, validates it exists, and exports a typed `config` object.

```typescript
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

export interface EnvConfig {
  displayName: string;
  baseUrl: string;
  apiUrl: string;
  loginPath: string;
  username: string;
  password: string;
}

const environment = (process.env.ENVIRONMENT ?? 'sint').toLowerCase();
const opco        = process.env.OPCO ?? 'AUTH_POC';

// Resolves to: src/config/env/<environment>/<OPCO>/config.json
const configPath = path.join(__dirname, 'env', environment, opco, 'config.json');

if (!fs.existsSync(configPath)) {
  throw new Error(
    `No config found for ENVIRONMENT="${environment}" OPCO="${opco}".\n` +
    `Expected file: ${configPath}\n` +
    `Add a config.json at: src/config/env/${environment}/${opco}/config.json`,
  );
}

const envConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as EnvConfig;

export const config = {
  environment,
  opco,
  ...envConfig,           // displayName, baseUrl, apiUrl, loginPath, username, password
  logging: {
    level: process.env.LOG_LEVEL ?? 'INFO',
  },
};
```

### `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';
import { config } from './src/config';

export default defineConfig({
  testDir: './src/tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
  ],
  use: {
    baseURL: config.baseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

### `tsconfig.json` with Path Aliases

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "baseUrl": ".",
    "paths": {
      "@pages/*": ["src/pages/*"],
      "@modules/*": ["src/modules/*"],
      "@utils/*": ["src/utils/*"],
      "@config/*": ["src/config/*"],
      "@fixtures": ["src/fixtures/index.ts"],
      "@testdata/*": ["src/testdata/*"],
      "@api/*": ["src/api/*"]
    }
  },
  "include": ["src/**/*", "playwright.config.ts"]
}
```

### Adding a new environment

1. Create folder: `src/config/env/<new-env>/`
2. Add an `<OPCO>/config.json` for each OPCO under that environment
3. Set `ENVIRONMENT=<new-env>` in `.env` — done. No TypeScript changes.

### Adding a new OPCO

1. Create folder: `src/config/env/sint/<NEW-OPCO>/`
2. Add `config.json` with the OPCO's SINT values
3. Repeat for `preprod` and `prod`
4. Set `OPCO=<NEW-OPCO>` in `.env` — done. No TypeScript changes.

---

## Layer 2: Pages (Locators Only)

Pages define locators as arrow functions and expose simple UI actions. **No business logic. No conditionals. No assertions.**

### `src/pages/BasePage.ts`

```typescript
import { Page } from '@playwright/test';

export abstract class BasePage {
  constructor(protected page: Page) {}

  async navigate(path: string): Promise<void> {
    await this.page.goto(path);
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async takeScreenshot(name: string): Promise<Buffer> {
    return this.page.screenshot({ fullPage: true, path: `test-results/${name}.png` });
  }
}
```

### `src/pages/LoginPage.ts`

```typescript
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Locators as arrow functions -- ALWAYS this pattern
  usernameInput = () => this.page.locator('#username');
  passwordInput = () => this.page.locator('#password');
  submitBtn     = () => this.page.getByRole('button', { name: 'Login' });
  errorMessage  = () => this.page.locator('.error-message');

  // Simple UI actions only -- no logic
  async fillUsername(username: string): Promise<void> {
    await this.usernameInput().fill(username);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput().fill(password);
  }

  async clickSubmit(): Promise<void> {
    await this.submitBtn().click();
  }

  async getErrorText(): Promise<string> {
    return (await this.errorMessage().textContent()) ?? '';
  }
}
```

### `src/pages/index.ts`

```typescript
export { BasePage } from './BasePage';
export { LoginPage } from './LoginPage';
// add more page exports here as you build them
```

---

## Layer 3: Modules (Business Logic)

Modules orchestrate Page methods into business workflows. **All conditional logic, multi-step flows, and domain knowledge live here.** Modules never call `page.locator()` directly.

### `src/modules/LoginModule.ts`

```typescript
import { Page, expect } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';
import { Logger } from '@utils/Logger';
import { config } from '@config/index';

export class LoginModule {
  private logger: Logger;

  constructor(
    private page: Page,
    private loginPage: LoginPage,
  ) {
    this.logger = new Logger('LoginModule');
  }

  async doLogin(
    username: string = config.username,
    password: string = config.password,
  ): Promise<void> {
    this.logger.info(`[${config.opco}][${config.environment}] Logging in as: ${username}`);
    await this.loginPage.navigate(config.loginPath);
    await this.loginPage.fillUsername(username);
    await this.loginPage.fillPassword(password);
    await this.loginPage.clickSubmit();
    await this.loginPage.waitForPageLoad();
    this.logger.info('Login completed');
  }

  async doLogout(): Promise<void> {
    this.logger.info('Logging out');
    await this.page.goto('/logout');
    await this.loginPage.waitForPageLoad();
  }

  async verifyLoginFailed(expectedError: string): Promise<void> {
    const errorText = await this.loginPage.getErrorText();
    expect(errorText).toContain(expectedError);
    this.logger.warn(`Login failed as expected: ${expectedError}`);
  }
}
```

### `src/modules/index.ts`

```typescript
export { LoginModule } from './LoginModule';
// add more module exports here as you build them
```

---

## Layer 4: Utilities

### `src/utils/Logger.ts`

```typescript
type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export class Logger {
  constructor(private context: string) {}

  private log(level: LogLevel, message: string, data?: unknown): void {
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] [${level}] [${this.context}] ${message}`;
    if (data) {
      console.log(entry, JSON.stringify(data, null, 2));
    } else {
      console.log(entry);
    }
  }

  debug(message: string, data?: unknown): void { this.log('DEBUG', message, data); }
  info(message: string, data?: unknown): void  { this.log('INFO',  message, data); }
  warn(message: string, data?: unknown): void  { this.log('WARN',  message, data); }
  error(message: string, data?: unknown): void { this.log('ERROR', message, data); }
}
```

### `src/utils/WaitHelper.ts`

```typescript
import { Page } from '@playwright/test';

export class WaitHelper {
  constructor(private page: Page) {}

  async waitForCondition(
    condition: () => Promise<boolean>,
    timeout: number = 30_000,
    interval: number = 500,
  ): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await condition()) return;
      await this.page.waitForTimeout(interval);
    }
    throw new Error(`Condition not met within ${timeout}ms`);
  }

  async retry<T>(fn: () => Promise<T>, retries: number = 3, delay: number = 1000): Promise<T> {
    let lastError: Error | undefined;
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (i < retries - 1) await this.page.waitForTimeout(delay);
      }
    }
    throw lastError;
  }

  async waitForNetworkIdle(timeout: number = 10_000): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout });
  }
}
```

### `src/utils/DataGenerator.ts`

```typescript
export class DataGenerator {
  static randomEmail(): string {
    const id = Math.random().toString(36).substring(2, 10);
    return `user_${id}@test.com`;
  }

  static randomString(length: number = 10): string {
    return Math.random().toString(36).substring(2, 2 + length);
  }

  static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static uuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  static futureDate(daysAhead: number = 30): string {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    return date.toISOString().split('T')[0];
  }
}
```

### `src/utils/ApiHelper.ts`

```typescript
import { APIRequestContext } from '@playwright/test';
import { Logger } from './Logger';

export class ApiHelper {
  private logger: Logger;

  constructor(
    private request: APIRequestContext,
    private baseURL: string,
  ) {
    this.logger = new Logger('ApiHelper');
  }

  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    this.logger.info(`GET ${endpoint}`);
    const response = await this.request.get(`${this.baseURL}${endpoint}`, { headers });
    const body = await response.json();
    this.logger.debug(`Response ${response.status()}`, body);
    return body as T;
  }

  async post<T>(endpoint: string, data: unknown, headers?: Record<string, string>): Promise<T> {
    this.logger.info(`POST ${endpoint}`);
    const response = await this.request.post(`${this.baseURL}${endpoint}`, { data, headers });
    const body = await response.json();
    this.logger.debug(`Response ${response.status()}`, body);
    return body as T;
  }

  async put<T>(endpoint: string, data: unknown, headers?: Record<string, string>): Promise<T> {
    this.logger.info(`PUT ${endpoint}`);
    const response = await this.request.put(`${this.baseURL}${endpoint}`, { data, headers });
    return (await response.json()) as T;
  }

  async delete(endpoint: string, headers?: Record<string, string>): Promise<number> {
    this.logger.info(`DELETE ${endpoint}`);
    const response = await this.request.delete(`${this.baseURL}${endpoint}`, { headers });
    return response.status();
  }
}
```

### `src/utils/index.ts`

```typescript
export { Logger }        from './Logger';
export { WaitHelper }    from './WaitHelper';
export { DataGenerator } from './DataGenerator';
export { ApiHelper }     from './ApiHelper';
```

---

## Layer 5: API Testing

API classes wrap `ApiHelper` for a specific domain. They read `config.apiUrl`, so they automatically target the correct environment's API endpoint.

### `src/api/AuthApi.ts`

```typescript
import { APIRequestContext } from '@playwright/test';
import { ApiHelper } from '@utils/ApiHelper';
import { config } from '@config/index';

export class AuthApi {
  private api: ApiHelper;

  constructor(request: APIRequestContext) {
    this.api = new ApiHelper(request, config.apiUrl);
  }

  async login(username: string, password: string): Promise<{ token: string }> {
    return this.api.post('/api/auth/login', { username, password });
  }

  async refreshToken(token: string): Promise<{ token: string }> {
    return this.api.post('/api/auth/refresh', {}, { Authorization: `Bearer ${token}` });
  }
}
```

### `src/api/index.ts`

```typescript
export { AuthApi } from './AuthApi';
// add more API class exports here as you build them
```

---

## Layer 6: Custom Fixtures

Fixtures provide dependency injection. Tests never create Page or Module instances manually.

### `src/fixtures/index.ts`

```typescript
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
  // add more fixtures here as you add pages and modules
});

export { expect } from '@playwright/test';
```

---

## Layer 7: Test Specifications

Tests use fixtures, `test.step()`, and tags. They are concise because all logic lives in Modules.

### `src/tests/login.spec.ts`

```typescript
import { test, expect } from '@fixtures';
import { config } from '@config/index';

test.describe(`@P0 @Smoke @Login Login -- ${config.displayName} on ${config.environment}`, () => {
  test('should login with valid credentials', async ({ loginModule, loginPage }) => {
    await test.step('Login with configured OPCO credentials', async () => {
      await loginModule.doLogin();
    });

    await test.step('Verify successful login', async () => {
      const title = await loginPage.getTitle();
      expect(title).toBeTruthy();
    });
  });

  test('should show error for invalid credentials', async ({ loginModule }) => {
    await test.step('Attempt login with wrong password', async () => {
      await loginModule.doLogin(config.username, 'wrong_password');
    });

    await test.step('Verify error message is displayed', async () => {
      await loginModule.verifyLoginFailed('Invalid credentials');
    });
  });
});
```

---

## Environment & OPCO Selection

### Via `.env` file (local)

```dotenv
ENVIRONMENT=sint
OPCO=AUTH_POC
```

```bash
npx playwright test
```

### Via inline env vars (override / CI)

```bash
# PREPROD + FRA-CONNECT
ENVIRONMENT=preprod OPCO=FRA-CONNECT npx playwright test

# PROD + USA-CRAWFRD, smoke only
ENVIRONMENT=prod OPCO=USA-CRAWFRD npx playwright test --grep @Smoke
```

### Config resolution at a glance

```
ENVIRONMENT=preprod  +  OPCO=FRA-CONNECT
        ↓
src/config/env/preprod/FRA-CONNECT/config.json
        ↓
config.baseUrl, config.apiUrl, config.loginPath,
config.username, config.password, config.displayName
```

If the file does not exist, `index.ts` throws at startup with the exact path it expected, so the developer knows exactly which file to create.

### Adding a new environment

1. Create `src/config/env/<new-env>/`
2. For each OPCO, create `src/config/env/<new-env>/<OPCO>/config.json`
3. Set `ENVIRONMENT=<new-env>` in `.env`

**No TypeScript changes required.**

### Adding a new OPCO

1. Create `src/config/env/sint/<NEW-OPCO>/config.json`
2. Repeat for `preprod` and `prod`
3. Set `OPCO=<NEW-OPCO>` in `.env`

**No TypeScript changes required.**

---

## Test Tags

Use tags for selective test execution:

| Tag | Purpose | Command |
|-----|---------|---------|
| `@P0` | Critical priority | `npx playwright test --grep @P0` |
| `@P1` | High priority | `npx playwright test --grep @P1` |
| `@P2` | Medium priority | `npx playwright test --grep @P2` |
| `@Smoke` | Smoke suite | `npx playwright test --grep @Smoke` |
| `@Regression` | Full regression | `npx playwright test --grep @Regression` |
| `@Login` | Feature-specific | `npx playwright test --grep @Login` |

---

## Locator Priority

Always choose locators in this order:

1. `getByRole()` -- Accessible roles (button, link, heading)
2. `getByLabel()` -- Form input labels
3. `getByPlaceholder()` -- Input placeholders
4. `getByText()` -- Visible text content
5. `getByTestId()` -- `data-testid` attributes
6. CSS selectors -- Last resort only

---

## Common Commands

```bash
npm test                                          # Run all tests
npx playwright test --headed                      # See the browser
npx playwright test --ui                          # Playwright UI mode
npx playwright test --debug                       # Debug with inspector
npx playwright test --grep "@P0"                  # Run by tag
npx playwright test --project=chromium            # Single browser
npx playwright test login.spec.ts                 # Single file
npx playwright show-report                        # View HTML report
npx playwright codegen                            # Record tests
npx playwright show-trace trace.zip               # View trace

# Switch environment / OPCO inline
ENVIRONMENT=preprod OPCO=FRA-CONNECT npx playwright test
ENVIRONMENT=prod    OPCO=USA-CRAWFRD npx playwright test --grep @Smoke
```

---

## Best Practices

1. **Always use `test.step()`** for every meaningful action -- it powers HTML reports and trace viewer.
2. **Locators as arrow functions** in Pages -- ensures fresh locator evaluation every call.
3. **Never put business logic in Pages** -- if you see `if/else` in a Page class, move it to a Module.
4. **Use fixtures for all setup** -- tests should never call `new LoginPage(page)` directly.
5. **Use Logger, not console.log** -- structured logging with context, levels, and timestamps.
6. **Use DataGenerator for test data** -- never hardcode emails, phone numbers, or UUIDs.
7. **Tag every test** -- `@P0`/`@P1`/`@P2` for priority, feature tags for filtering.
8. **Keep tests independent** -- each test should set up its own state via `beforeEach` and fixtures.
9. **Use path aliases** -- `@pages/LoginPage` not `../../pages/LoginPage`.
10. **Read from `config`, not `process.env`** -- all resolution happens in `src/config/index.ts` once; everything else reads `config.xxx`.
11. **Config changes are JSON-only** -- adding or changing an environment or OPCO means editing `config.json` files, never TypeScript source.

---

## Anti-Patterns (Never Do This)

1. **Never use `page.locator()` in a Module** -- always go through the Page class methods.
2. **Never put conditional logic in Pages** -- Pages are dumb locator containers.
3. **Never use `page.waitForTimeout()`** -- use explicit waits via WaitHelper or Playwright's built-in waits.
4. **Never skip `test.step()`** -- naked `await` sequences produce unreadable reports.
5. **Never hardcode test data** -- use DataGenerator or JSON test data files.
6. **Never create page instances in tests** -- use fixtures for dependency injection.
7. **Never use XPath when a better locator exists** -- follow the locator priority order.
8. **Never share state between tests** -- each test is isolated, period.
9. **Never use `console.log` directly** -- use the Logger utility with proper levels.
10. **Never read `process.env` outside `src/config/index.ts`** -- all env vars are resolved once in the config loader.
11. **Never hardcode URLs or credentials** -- every value belongs in a `config.json` file.
12. **Never add TypeScript maps for new OPCOs or environments** -- use the folder structure instead.

---

## Code Review Checklist

Before merging any test code, verify:

**Config:**
- [ ] New OPCO has a `config.json` for every environment (`sint`, `preprod`, `prod`)
- [ ] New environment has a `config.json` for every OPCO
- [ ] No `process.env` reads outside `src/config/index.ts`
- [ ] No URLs or credentials hardcoded in TypeScript

**Page Class:**
- [ ] Locators defined as arrow functions
- [ ] No business logic or conditionals
- [ ] Extends `BasePage`
- [ ] Named exports only

**Module Class:**
- [ ] Uses Page class methods exclusively
- [ ] No direct `page.locator()` calls
- [ ] Logger used for step tracking
- [ ] Reads credentials/paths from `config` directly (`config.username`, `config.loginPath`)

**Test Spec:**
- [ ] Has priority tag (`@P0`, `@P1`, `@P2`)
- [ ] Has feature tag (`@Login`, etc.)
- [ ] All actions wrapped in `test.step()`
- [ ] Uses fixtures, not manual instantiation
- [ ] Independent from other tests

**General:**
- [ ] Files in correct layer directory
- [ ] Uses path aliases (`@pages/`, `@modules/`, `@config/`)
- [ ] No hardcoded values
- [ ] No `console.log` (use Logger)
- [ ] TypeScript strict mode passes
