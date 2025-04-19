---
slug: 005-k6-performance-testing
title: 'Performance Testing using k6'
description: 'Master performance testing with k6, the developer-friendly, open-source tool using JavaScript for powerful load generation. This practical guide covers installation, writing effective tests, setting performance goals, and integrating k6 into your CI/CD pipeline.'
pubDatetime: 2025-04-19T10:13:00Z
ogImage: ../../assets/images/005-k6-performance-testing.png
featured: false
draft: false
tags:
  - performance
---

![005-k6-performance-testing](@assets/images/005-k6-performance-testing.png)

**In today's fast-paced digital world, application performance isn't just a feature—it's a necessity.** Slow load times, unresponsive APIs, and systems buckling under pressure can lead to lost revenue, frustrated users, and damaged reputations. Performance testing is crucial for ensuring your applications can handle expected user loads and maintain responsiveness under stress.

Enter **k6**, an open-source load testing tool developed by Grafana Labs. Designed with developers and SREs in mind, k6 makes performance testing accessible, powerful, and easy to integrate into modern development workflows. It excels at testing APIs, microservices, and websites, using JavaScript for test scripting – a language familiar to many developers.

This guide will walk you through getting started with k6, writing effective tests, integrating them into your CI/CD pipeline, and understanding the results.

## Table of contents

## Why Choose k6?

Before diving in, let's understand what makes k6 stand out:

* **Developer-Friendly:** Uses JavaScript (ES2015/ES6) for scripting, lowering the barrier to entry.
* **High Performance:** Written in Go, k6 is resource-efficient, allowing you to simulate significant load from a single machine.
* **Goal-Oriented Testing:** Built-in support for **Thresholds** lets you define specific performance goals (SLOs) for your tests (e.g., 95th percentile response time < 500ms, error rate < 1%).
* **CI/CD Native:** Designed for automation, easily integrating into pipelines (GitHub Actions, GitLab CI, Jenkins, etc.).
* **Extensible:** Supports various protocols (HTTP/1.1, HTTP/2, WebSockets, gRPC) and can be extended.
* **Grafana Ecosystem:** Integrates seamlessly with Grafana for visualization and analysis, especially with Grafana Cloud k6.

## Installation

Getting k6 running on your system is straightforward. Choose the method appropriate for your OS:

* **MacOS** (using Homebrew)

    ```sh
    brew install k6
    ```

* **Windows** (using Chocolatey)

    ```sh
    choco install k6
    ```

    or (using Winget)

    ```sh
    winget install k6 --source winget
    ```

* **Linux (Debian/Ubuntu)**

    ```sh
    sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
    echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
    sudo apt-get update
    sudo apt-get install k6
    ```

* **Docker**

    ```sh
    docker pull grafana/k6
    # To run a test:
    # docker run -i grafana/k6 run - <test.js
    ```

After installation, verify it by checking the version (your version might differ):

```sh
k6 version
# k6 v0.50.0 (commit/f9700f5746, go1.21.6, linux/amd64)
```

## Your First k6 Test

k6 tests are written in JavaScript. Here’s a basic example that sends a GET request to a test API and checks if the response status is 200 (OK).

```javascript
// test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

// 'export default function' defines the entry point for Virtual Users (VUs)
export default function () {
  // Send a GET request
  const res = http.get('https://httpbin.test.k6.io/get'); // Using k6's test service

  // Check if the request was successful (status code 200)
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response body contains User-Agent': (r) => r.body.includes('k6'),
  });

  // Add a short pause (think time) between iterations
  sleep(1); // Pauses execution for 1 second
}
```

Save this code as `test.js`. Let's break it down:

1. **`import` statements:** Load necessary k6 modules (`http` for requests, `check` for assertions, `sleep` for pauses).
2. **`export default function () { ... }`:** This is the main code block executed by each Virtual User (VU). k6 simulates multiple VUs running this function concurrently or sequentially.
3. **`http.get(...)`:** Sends an HTTP GET request to the specified URL.
4. **`check(res, { ... })`:** Defines one or more assertions on the response (`res`). Checks don't stop the test if they fail; they are recorded in the results. This is crucial for understanding success rates.
5. **`sleep(1)`:** Introduces a 1-second pause. This simulates user think time and prevents overwhelming the target system immediately.

## Running the Test

Execute the script from your terminal:

```sh
k6 run test.js
```

By default, this runs the script with **1 Virtual User (VU)** for **1 iteration**. You'll see a summary output in your console showing metrics like request duration, checks passed/failed, data sent/received, etc.

## Configuring Load: VUs and Duration

Running with 1 VU isn't much of a "load" test. k6 provides powerful options to configure the load profile:

**1. Command-Line Flags:**

```sh
# Run with 10 VUs for 30 seconds
k6 run --vus 10 --duration 30s test.js
```

**2. Options in the Script (Recommended for complex scenarios):**

You can define test options directly within your JavaScript file using the `export const options = { ... };` syntax. This keeps your test configuration version-controlled alongside your script.

```javascript
// test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,          // Number of Virtual Users
  duration: '30s',  // Total test duration
};

export default function () {
  // ... (same code as before)
  const res = http.get('https://httpbin.test.k6.io/get');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
```

## Simulating Realistic Traffic with Stages

Real-world traffic rarely jumps instantly to peak load. The `stages` option allows you to define phases for ramping VUs up and down:

```javascript
// realistic-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    // Ramp-up phase: Gradually increase VUs
    { duration: '1m', target: 50 },  // Ramp up to 50 VUs over 1 minute

    // Sustained load phase: Stay at peak load
    { duration: '3m', target: 50 },  // Stay at 50 VUs for 3 minutes

    // Ramp-down phase: Gradually decrease VUs
    { duration: '1m', target: 0 },   // Ramp down to 0 VUs over 1 minute
  ],
};

export default function () {
  const res = http.get('https://httpbin.test.k6.io/get');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
```

This simulates a more realistic pattern: users gradually arriving, staying for a while, and then leaving.

## Test Lifecycle: `setup` and `teardown`

k6 provides special functions for code that needs to run only once per test run:

* **`setup()`:** Runs *once* at the beginning of the test, before VUs start executing the `default` function. Ideal for preparing test data or fetching authentication tokens. Data returned from `setup` is passed as an argument to the `default` and `teardown` functions.
* **`teardown()`:** Runs *once* at the end of the test, after all VUs have finished. Useful for cleaning up test data or post-processing results.

```javascript
import http from 'k6/http';
import { sleep } from 'k6';

// Setup function: Runs once before the test starts
export function setup() {
  console.log('Setting up the test...');
  // Example: Fetch an auth token or prepare data
  const authToken = 'my-super-secret-token'; // Replace with actual token fetching logic
  return { token: authToken }; // Pass data to VUs and teardown
}

// Teardown function: Runs once after the test finishes
export function teardown(data) {
  console.log('Tearing down the test...');
  // Example: Clean up resources or log final info
  console.log(`Test finished. Used token: ${data.token}`);
}

// VU function: Receives data from setup
export default function (data) {
  const params = {
    headers: {
      'Authorization': `Bearer ${data.token}`,
    },
  };
  http.get('https://httpbin.test.k6.io/bearer', params);
  sleep(1);
}
```

## Defining Performance Goals with Thresholds

One of k6's most powerful features is **Thresholds**. They allow you to define pass/fail criteria for your tests based on specific metrics. If any threshold fails, k6 will exit with a non-zero status code, making it perfect for CI/CD integration.

```javascript
// test-with-thresholds.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 20,
  duration: '1m',
  thresholds: {
    // Define performance goals (SLOs)
    'http_req_duration': ['p(95)<500'], // 95% of requests must complete below 500ms
    'http_req_failed': ['rate<0.01'],   // Request error rate must be less than 1%
    'checks': ['rate>0.99'],            // Over 99% of checks must pass
  },
};

export default function () {
  const res = http.get('https://httpbin.test.k6.io/delay/0.2'); // Endpoint with 200ms delay

  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  sleep(1);
}

```

When you run this test, k6 will evaluate these thresholds against the collected metrics and indicate pass/fail status in the summary.

## Handling Common Scenarios

### Authentication

* **Basic Auth:**

    ```javascript
    import http from 'k6/http';
    import encoding from 'k6/encoding';

    export default function () {
      const username = 'user';
      const password = 'password';
      const encodedCredentials = encoding.b64encode(`${username}:${password}`);
      const params = {
        headers: {
          'Authorization': `Basic ${encodedCredentials}`,
        },
      };
      http.get('https://your-api.com/protected', params);
    }
    ```

* **Bearer Token:** (Often retrieved in `setup`)

    ```javascript
    import http from 'k6/http';

    export function setup() {
      // In a real scenario, you'd make a request to your auth endpoint here
      const token = 'your-secret-api-token';
      return { authToken: token };
    }

    export default function (data) {
      const params = {
        headers: {
          'Authorization': `Bearer ${data.authToken}`,
        },
      };
      http.get('https://your-api.com/protected', params);
    }
    ```

### Sending POST Requests (JSON Payload)

```javascript
import http from 'k6/http';
import { check } from 'k6';

export default function () {
  const url = 'https://httpbin.test.k6.io/post';
  const payload = JSON.stringify({
    name: 'k6 user',
    job: 'performance tester',
  });
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(url, payload, params);

  check(res, {
    'status is 201': (r) => r.status === 201, // Or 200 depending on your API
    'response contains name': (r) => r.body.includes('k6 user'),
  });
}
```

### Working with Test Data

* **Reading Files:** Use the built-in `open()` function.

    ```javascript
    // Read a text file (e.g., list of IDs)
    const userIds = open('./data/user_ids.txt').split('\n');

    // Read a binary file (e.g., for uploads)
    const imageData = open('./data/image.png', 'b'); // 'b' for binary mode

    export default function() {
        const userId = userIds[__VU % userIds.length]; // Distribute users across VUs
        console.log(`VU ${__VU} processing user ID: ${userId}`);
        // Use imageData for a file upload request...
    }
    ```

* **Large Datasets (`SharedArray`):** For large data files, load them once into memory shared across all VUs to save resources.

    ```javascript
    import { SharedArray } from 'k6/data';
    import http from 'k6/http';

    // Load data once, share across VUs
    const usersData = new SharedArray('users', function () {
      // Load data from a JSON file (must be an array of objects)
      return JSON.parse(open('./data/users.json'));
    });

    export default function () {
      // Get a unique user for this iteration
      const user = usersData[__ITER % usersData.length];

      http.post('https://your-api.com/users', JSON.stringify(user));
    }
    ```

## Understanding and Customizing Results

k6 provides a detailed summary in the console after each run. Key metrics include:

* `http_req_duration`: Time taken for requests (avg, min, max, p90, p95, p99).
* `http_req_failed`: Percentage of failed requests.
* `vus`: Number of active virtual users over time.
* `checks`: Pass/fail rate of your `check` assertions.
* `iterations`: Total number of times the `default` function executed.

### Custom Summary (`handleSummary`)

You can generate custom reports (e.g., JSON, HTML) using the `handleSummary` function, which runs after `teardown`.

```javascript
import { textSummary } from 'k6/summary'; // Correct import path
import { htmlReport } from "https://jslib.k6.io/k6-summary/0.0.1/index.js"; // For HTML reports

export function handleSummary(data) {
  console.log('Finished executing test script');

  // Standard text summary to stdout
  const standardOutput = textSummary(data, { indent: '  ', enableColors: true });

  // JSON summary to a file
  const jsonOutput = JSON.stringify(data, null, 2); // Pretty print JSON

  // HTML report to a file
  const htmlOutput = htmlReport(data);

  return {
    'stdout': standardOutput,
    'summary.json': jsonOutput,
    'summary.html': htmlOutput,
  };
}

// Include your options and default function here...
export const options = { /* ... */ };
export default function() { /* ... */ };
```

This generates the standard console output, a `summary.json` file, and an interactive `summary.html` report.

## Integrating k6 into CI/CD Pipelines

Automating performance tests in your CI/CD pipeline ("Shift-Left" performance testing) is crucial for catching regressions early.

**Example: GitHub Actions Workflow**

```yaml
# .github/workflows/k6-test.yml
name: k6 Performance Test

on: [push] # Or pull_request, schedule, etc.

jobs:
  k6_test:
    name: Run k6 load test
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4 # Use the latest version

      - name: Run k6 local test
        uses: grafana/k6-action@v0.3.1 # Use the latest version
        with:
          filename: tests/performance/main-test.js # Path to your k6 script
          # Optional: Add flags like VUs/duration if not defined in script options
          # flags: --vus 10 --duration 1m

      # Optional: Upload test results artifact (e.g., summary.json)
      - name: Upload k6 results
        uses: actions/upload-artifact@v4
        with:
          name: k6-results
          path: |
            summary.json
            summary.html
          # Optional: only upload if the k6 step succeeded
          # if: success()
```

**Key Integration Points:**

1. **Trigger:** Decide when to run the tests (e.g., on every push to `main`, on pull requests, nightly).
2. **Run k6:** Use official actions (like `grafana/k6-action`) or simply install and run k6 via shell commands.
3. **Thresholds for Gates:** Rely on k6's exit code. If thresholds fail, k6 exits non-zero, failing the CI step automatically. This acts as a performance gate.
4. **Artifacts:** Store summary reports (JSON, HTML) as build artifacts for later analysis.

## Best Practices for Effective k6 Testing

1. **Version Control Your Tests:** Treat test scripts like application code. Store them in Git.
2. **Use Realistic Scenarios:** Model user behavior with `stages`, `sleep`, and varied request types.
3. **Set Meaningful Thresholds:** Define clear performance goals based on requirements or historical baselines.
4. **Test in Appropriate Environments:** Aim for a staging environment that mirrors production as closely as possible.
5. **Don't Forget Dependencies:** Test the performance impact of databases, external APIs, and other services your application relies on.
6. **Monitor System Under Test:** Correlate k6 results with server-side metrics (CPU, memory, network, application logs) during the test.
7. **Start Simple, Iterate:** Begin with basic smoke tests and gradually build more complex scenarios.
8. **Leverage k6 Cloud:** For large-scale tests requiring distributed load generation or easier collaboration and result analysis, consider Grafana Cloud k6.

## Conclusion

k6 offers a powerful, flexible, and developer-centric approach to performance testing. By leveraging its JavaScript scripting, robust configuration options, threshold-based assertions, and CI/CD friendliness, you can build performance testing into your development lifecycle, ensuring your applications are fast, reliable, and ready to handle real-world load.

Start small, integrate early, and make performance a continuous part of your quality strategy with k6. Happy testing!
