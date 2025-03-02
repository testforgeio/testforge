---
slug: 001-playwright-quickstart
title: Playwright QuickStart
description:
  A step-by-step guide to setting up and using Playwright for End-to-End testing of web applications.
pubDatetime: 2024-07-08T15:22:00Z
ogImage: ../../assets/images/001-pw-vscode.png
featured: false
draft: false
tags:
  - typescript
  - playwright
---

[Playwright](https://playwright.dev/) is a premier tool for browser automation.
While there are competitors like Cypress and WebdriverIO, choosing Playwright ensures you won't be disappointed.
It has everything you need for end-to-end testing of web applications and maybe even more.

Let’s dive into this quick guide and get you up to speed.

## Table of contents

## Install Node.js

First of all, you need to have Node.js installed on your system. The best way to handle this is by using [nvm](https://github.com/nvm-sh/nvm).

**nvm (Node Version Manager)** - is a CLI tool that allows you to install and manage multiple versions of Node.js.
Install the current LTS Node.js by using the `--lts` flag. Or you can install a specific version by adding the version number after `nvm install`.

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install --lts
```

Verify the installation by listing the installed versions and checking the Node.js version output.

```bash
nvm ls
node --version
```

## Install package manager

In order to handle your project dependencies, you need to have a package manager installed.
You can choose between [npm](https://docs.npmjs.com/), [yarn](https://yarnpkg.com/) or [pnpm](https://pnpm.io/).
I will use npm in the scope of this article. You don't need to install it separately, it comes automatically as part of Node.js.

## Install Playwright

Playwright has `init` command that will create a basic folder structure for you.

```bash
mkdir playwright
cd playwright
npm init playwright@latest -y
```

When you run it, it will guide you through a simple wizard to set up the project.

* *Choose the language you want to use for your tests?*  
  
  `TypeScript` is recommended because it provides type checking and better code completion.

* *Choose the name of the folder where your tests will be stored?*  

  Default is `tests` but you can change it to `src/tests` or `spec` for example.

* *Do you want to add a [GitHub Actions](https://github.com/features/actions) workflow file?*  
  
  Makes sense if you are planning to run tests as part of CI/CD pipeline on GitHub.

* *Install Playwright for all three browsers (Chromium, Firefox, WebKit)?*  
  
  Having browsers installed is required to run tests. Of course, you can install them later.
  However, if it is your first installation, it is better to have them installed right away.

* *Install Playwright operating system dependencies?*  
  
  These dependencies include libraries and tools that are needed for browser automation and testing. Requires `sudo` or `root`. Press `N` and install them manually with the neccessary permissions.

You should see files and folders created in your project directory after answering the questions.

```text
playwright
├─ .github
│  └─ workflows
│     └─ playwright.yml
├─ node_modules
├─ tests
│  └─ example.spec.ts
├─ tests-examples
|  └─ demo-todo-app.spec.ts
├─ .gitignore
├─ package-lock.json
├─ package.json
└─ playwright.config.ts
```

Finally, install system dependencies using `sudo`

```bash
sudo npx playwright install-deps
```

## Run tests from terminal

By default, Playwright executes tests across three browsers: Chromium, Firefox, and WebKit, utilizing three workers concurrently.
This behavior can be customized in the `playwright.config` file.

Tests are executed in headless mode, meaning the browsers will not open during test execution.
Test results and logs are displayed in the terminal. `--headed` flag will open the browser during test execution.

```bash
npx playwright test --headed
```

## Install VSCode extension

Playwright has an official [extension](https://playwright.dev/docs/getting-started-vscode)
for Visual Studio Code that provides code snippets, IntelliSense, and debugging support.
Install the extension from the VSCode Extensions tab. After installation, you will be able to run tests directly from the editor.

![Playwright VSCode extension](@assets/images/001-pw-vscode.png)

## Key features

* **Auto-waiting**: uses a smart waiting algorithm to wait for elements to be visible, enabled, or to contain specific text
* **Multi-Browser Support**: supports Chromium, Firefox, and WebKit browsers
* **Fast Execution**: runs tests across multiple browsers in parallel
* **Intuitive API**: provides a simple and intuitive API for automating browsers
* **Advanced Debugging Tools**: features tools like Playwright Inspector, Codegen, and Trace Viewer, which facilitate efficient debugging and test script generation

## Test Design Best Practices

It is essential to follow [best practices](https://playwright.dev/docs/best-practices) when setting up an end-to-end framework for your project.
Whether you are a tester working on a dedicated QA team, adding tests in collaboration with developers, or working as a solo entrepreneur, you need to follow these guidelines.
Otherwise, you will end up with flaky or brittle tests and spend more time maintaining them than receiving effective feedback.

* **Focus on User-Visible Behaviors**  
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

## Conclusion

Playwright provides powerful tools for modern web application testing. With this guide, you've learned to set up a project,
run tests, and implement best practices.

Example project with tests is available [here](https://github.com/testforgeio/testforge/tree/main/examples/playwright-quickstart).
