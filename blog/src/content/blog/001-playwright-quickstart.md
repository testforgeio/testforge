---
title: 'Playwright quickstart'
description: 'Playwright End-to-End testing guide'
pubDate: 'Jul 08 2024'
heroImage: '/blog-001-playwright-quickstart.png'
---

Playwright is a modern, reliable testing framework for browser automation. It offers multi-browser support and robust tools for end-to-end testing of web applications. Let's get started with this quick guide.

### Set Up a Git Repository

First, create a new Git repository for your Playwright project:

* Create a new directory

```bash
mkdir playwright-quickstart && cd playwright-quickstart
```

* Initialize a Git repository

```bash
git init
```

* Create a `.gitignore` file for Node.js projects*

```bash
echo "node_modules/" >> .gitignore
```

* Commit your changes:

```bash
git add .gitignore
git commit -m "Initialize git repository"
```

### Initialize Playwright

Install Playwright in your project

* Initialize a Node.js project*

```bash
npm init -y
```

* Install Playwright

```bash
npm install -D playwright
```

* Set up the configuration and directory structure

```bash
npx playwright install
npx playwright init
```

This creates a basic folder structure

```text
- tests/
- playwright.config.ts
```

### Install Browsers

Playwright works with Chromium, Firefox, and WebKit browsers.
While these are automatically installed during initialization, you can reinstall them if needed.

```bash
npx playwright install
```

### Add Tests

Create a simple test using JavaScript or TypeScript in the tests/ directory

```js
import { test, expect } from '@playwright/test';

test('Basic test', async ({ page }) => {
  await page.goto('https://example.com');
  const title = await page.title();
  expect(title).toBe('Example Domain');
});
```

Run your tests:

```bash
npx playwright test
```

### Locating Elements

Use Playwright's built-in waiting mechanism for reliable element interactions

```js
await page.locator('text=Submit').click(); *// Waits until the element is visible and stable*
await expect(page.locator('#success-message')).toBeVisible(); *// Waits for a success message*
```

### Run Tests on Multiple Browsers

Configure Playwright to run tests across different browsers

```js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  projects: [
    { name: 'Chromium', use: { browserName: 'chromium' } },
    { name: 'Firefox', use: { browserName: 'firefox' } },
    { name: 'WebKit', use: { browserName: 'webkit' } },
  ],
});
```

Run tests across all browsers:

```bash
npx playwright test --project=all
```

### Set Custom Timeouts

Customize timeouts for different scenarios

```js
// Set default timeout for all actions
test.use({ timeout: 15000 });
// Set timeout for a specific action
await page.waitForSelector('#element', { timeout: 5000 });
```

### Reports

Generate HTML reports for better test result analysis

```js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [['html', { open: 'never' }]],
});
```

After running the tests

```bash
npx playwright show-report
```

### Best Practices

* **Focus on User-Visible Behavior**  
Test what end-users see and interact with, avoiding implementation details.
* **Test Isolation**  
Ensure each test runs independently with its own resources (storage, session, data, etc.). Use before/after hooks for setup/teardown, but avoid excessive reliance on them. Consider using setup projects for shared setup tasks.
* **Avoid Third-Party Dependencies**  
Test only what you control. Use Playwright's Network API to mock external responses.
* **Use Semantic Locators**  
Prioritize user-facing attributes (roles, labels, `data-testid`) over brittle selectors (XPath, CSS classes). Use Playwright's codegen tool to assist with locator selection.
* **Page Object Model**  
Structure tests using page objects for improved readability, maintainability, and reusability.
* **Atomic Tests**  
Each test should validate a single, specific functionality.
* **Test Across Browsers**  
Configure Playwright to run tests across different browsers and devices.
* **Keep Playwright Updated**  
Regularly update your Playwright dependency to benefit from the latest features and browser compatibility.
* **CI/CD Integration**  
Run tests frequently on CI/CD using Linux for cost-effectiveness, and consider sharding for faster execution. Optimize browser installations on CI by only installing necessary browsers.
* **Lint Your Tests**  
Use TypeScript and ESLint (including `@typescript-eslint/no-floating-promises`) to catch errors early.
* **Parallelism and Sharding**  
Utilize Playwright's parallel execution and sharding capabilities for faster test runs.
* **Soft Assertions**  
Use soft assertions to gather all failures within a single test run without immediately halting execution.

### Conclusion

Playwright provides powerful tools for modern web application testing. With this guide, you've learned to set up a project,
write tests, and implement best practices. Consider adding CI/CD pipelines to automate your testing process!
