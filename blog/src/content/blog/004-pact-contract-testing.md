---
slug: 004-pact-contract-testing
title: 'Contract Testing using Pact'
description: 'A concise guide to using Pact for consumer‑driven contract testing between TypeScript frontends and Java microservices—covering setup with and without a Pact Broker, environment management, PactFlow’s “can‑i‑deploy” gates, and comparisons to Spring Cloud Contract and OpenAPI.'
pubDatetime: 2025-04-18T10:44:00Z
ogImage: ../../assets/images/004-pact-contract-testing.png
featured: false
draft: false
tags:
  - pact
  - ct
---

Modern software architecture often relies on a distributed system of microservices and frontend applications communicating via APIs. While this offers flexibility and scalability, ensuring seamless integration between these independent components presents significant challenges. Traditional end-to-end integration tests become slow, brittle, and difficult to manage as the system grows.

## Table of contents

**How can teams confidently deploy services independently without breaking consumers? How can we get fast feedback on API compatibility *before* deploying to complex environments?**

**Contract testing** provides a powerful solution by shifting integration checks earlier in the development lifecycle. Instead of testing entire deployed systems, contract testing verifies that each service (consumer or provider) adheres to a shared understanding – an **API contract** – defined by concrete interaction examples.

**Pact** is a leading open-source framework for **consumer-driven contract testing (CDC)**. It helps teams define, share, and verify these contracts, enabling independent deployments with confidence.

This article will guide you through:

* The pitfalls of traditional integration testing in microservices.
* The core concepts of consumer-driven contract testing with Pact.
* Implementing Pact tests step-by-step (TypeScript consumer, Java provider) **without** a Pact Broker.
* Leveraging the **Pact Broker** for scalable contract management and collaboration.
* Managing contracts across different deployment environments (dev, staging, prod).
* Ensuring safe releases using **PactFlow** and the `can-i-deploy` tool.
* Comparing Pact with other contract testing approaches (Spring Cloud Contract, OpenAPI).

Let's dive in!

## The Pain Points: Why Traditional Integration Testing Struggles with Microservices

When building systems with many interacting services, relying solely on traditional integration tests often leads to significant hurdles:

1. **Complex and Brittle Test Environments:** Setting up and maintaining environments that replicate production, including all necessary service dependencies, is resource-intensive, costly, and prone to configuration drift. Tests become **brittle** because a failure in any single component or network glitch can cause the entire test suite to fail, making debugging difficult. Running a full suite involving dozens of services simply doesn't scale.
2. **Slow Feedback Loops:** End-to-end tests are inherently slow to execute. Waiting minutes (or hours!) for feedback drastically slows down development cycles and discourages frequent testing. Diagnosing failures is also time-consuming as the root cause could lie in any of the interacting services.
3. **Tight Coupling and Deployment Bottlenecks:** Over-reliance on integration tests can inadvertently lead to **lock-step releases**. Teams become hesitant to deploy a service independently, fearing it might break untested interactions with other services. Testing compatibility across all possible version combinations of dependent services is practically impossible.
4. **Poor Failure Isolation:** When an integration test fails, it often indicates *that* something broke, but not necessarily *who* is at fault (the consumer expecting a change or the provider making one?). Pinpointing the source requires manual investigation across service boundaries.

In essence, traditional integration tests in distributed systems tend to be **fragile, expensive, slow, and hinder independent deployability**. We need a more targeted approach.

*(Figure 1: Contract tests shift focus, reducing reliance on slow, brittle E2E tests by verifying interactions at service boundaries, providing faster feedback. Source: Inspired by Pactflow diagrams)*

## What is Contract Testing? (Consumer-Driven Contracts Explained)

**Contract testing** verifies the interactions between API consumers and providers against a shared agreement, the **contract**. Instead of deploying both services, contract tests work in isolation:

* **Consumer Side:** Tests assert that the consumer code can correctly generate requests and handle the expected responses defined in the contract.
* **Provider Side:** Tests verify that the provider can actually produce the responses expected by the consumer for given requests, as defined in the contract.

The contract itself isn't just a static schema (like OpenAPI); it consists of **concrete examples of interactions** (request/response pairs). This ensures alignment on specific data formats, status codes, and headers for real-world scenarios.

**Consumer-Driven Contracts (CDC):** Pact champions the CDC approach. Here, the **consumer** dictates its expectations by defining the interactions it needs from the provider. This makes sense – the consumer knows precisely what data and format it requires to function. The provider's responsibility is then to prove it can fulfill these documented expectations.

**Why is this powerful?**

* **Early Detection of Breaking Changes:** If a provider modifies its API in a way that violates a consumer's documented needs (e.g., renaming a field, changing a data type), the provider's contract verification test fails *in the provider's own CI pipeline*, long before deployment.
* **Fast, Isolated Feedback:** Contract tests typically run as part of each service's unit/integration test suite, executing in seconds or minutes. They don't require external dependencies or complex environments. Failures point directly to the specific interaction and service responsible.
* **Enables Independent Deployments:** Confidence in API compatibility allows teams to develop and deploy services at their own pace, knowing they haven't broken existing integrations defined in the contracts.
* **Living Documentation:** The generated contract files (usually JSON) serve as reliable, up-to-date documentation of API interactions, reflecting actual usage patterns.

Contract tests don't replace *all* other forms of testing, but they significantly **reduce the need for extensive end-to-end integration suites**, allowing those to focus on verifying critical business flows rather than basic API compatibility.

## Implementing Contract Testing with Pact (Without a Pact Broker)

Let's walk through setting up Pact for a simple scenario: a TypeScript frontend (consumer) interacting with a Java backend (provider). We'll start **without** using a Pact Broker, meaning the contract file generated by the consumer will be shared manually (e.g., checked into the provider's repository or shared via artifacts).

Our example: A `petstore-frontend` (consumer) needs to fetch pet details from `petstore-backend` (provider) via a `GET /pets/{id}` endpoint.

The Pact workflow involves two key steps:

1. **Consumer Test:** Define interactions, run consumer code against a Pact mock server, generate the contract file.
2. **Provider Verification:** Load the contract file, replay interactions against the real provider, verify responses match the contract.

### Step 1: Consumer-Side Contract Definition (TypeScript)

On the consumer side (e.g., a React/Vue/Angular app or a Node.js service), we use `@pact-foundation/pact`.

1. **Install Dependencies:**
    ```bash
    npm install --save-dev @pact-foundation/pact jest ts-jest @types/jest
    # or using yarn:
    # yarn add --dev @pact-foundation/pact jest ts-jest @types/jest
    ```

2. **Write the Contract Test (`petApi.consumer.spec.ts`):**
    Assume you have an API client class `PetClient` that fetches pet data.

    ```typescript
    import { Pact } from '@pact-foundation/pact';
    import path from 'path';
    import { PetClient } from './petClient'; // Your API client implementation

    // Configure the Pact mock provider
    const provider = new Pact({
      consumer: 'petstore-frontend', // Consumer name
      provider: 'petstore-backend', // Provider name (must match provider test)
      port: 1234,                  // Port for the mock server
      log: path.resolve(process.cwd(), 'logs', 'pact.log'), // Log file
      dir: path.resolve(process.cwd(), 'pacts'), // Output directory for pact files
      logLevel: 'warn',
    });

    describe('Pet API Contract Test', () => {
      // 1. Start the Pact mock server before tests
      beforeAll(() => provider.setup());

      // 3. Verify interactions after each test (ensures all mock calls were made)
      afterEach(() => provider.verify());

      // 4. Finalize Pact and write the contract file after all tests
      afterAll(() => provider.finalize());

      describe('Fetching a pet', () => {
        it('should return pet details when a pet exists', async () => {
          // 2. Define the expected interaction (the contract)
          await provider.addInteraction({
            // A descriptive state the provider needs to be in
            state: 'a pet with ID 123 exists',
            // Description of the request
            uponReceiving: 'a request to fetch pet details for ID 123',
            // Define the expected request from the consumer
            withRequest: {
              method: 'GET',
              path: '/pets/123',
              headers: { Accept: 'application/json' },
            },
            // Define the expected response from the provider
            willRespondWith: {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
              // Body can use Pact Matchers for flexibility (e.g., Pact.eachLike, Pact.like)
              // Here, we expect an exact structure for simplicity
              body: {
                id: 123,
                name: 'Fido',
                status: 'available',
              },
            },
          });

          // Execute the actual consumer code that makes the API call
          // The PetClient should be configured to hit the mock server URL
          const client = new PetClient(provider.mockService.baseUrl);
          const pet = await client.getPet(123);

          // Assert that the consumer code handled the response correctly
          expect(pet).toBeDefined();
          expect(pet.id).toBe(123);
          expect(pet.name).toBe('Fido');
          expect(pet.status).toBe('available');
        });
      });

      // Add more interactions for other endpoints (POST /pets, PUT /pets/123, etc.)
    });
    ```

3. **Run the Consumer Test:**
    Executing this test (e.g., via `jest`) will:
    * Start a mock server on `http://localhost:1234`.
    * Register the defined interaction (`GET /pets/123`).
    * Run your `PetClient` code, which hits the mock server.
    * Verify the request matched the expectation and the response was handled.
    * Generate a contract file: `pacts/petstore-frontend-petstore-backend.json`. This JSON file *is* the contract.

    **Key Points:**
    * `state`: Describes a precondition on the provider (e.g., "data exists"). The provider test needs to handle this.
    * `uponReceiving`: Human-readable description of the request.
    * `withRequest`: Specifies the exact request the consumer will send (method, path, headers, body).
    * `willRespondWith`: Specifies the exact response the consumer expects (status, headers, body). Pact Matchers can be used here for more flexible matching (e.g., checking types instead of exact values).
    * `provider.verify()`: Ensures the consumer code actually made the expected API call during the test.
    * `provider.finalize()`: Writes the pact file.

### Step 2: Provider-Side Contract Verification (Java)

Now, we take the generated `petstore-frontend-petstore-backend.json` file and use it to verify our Java Spring Boot backend (`petstore-backend`).

1. **Share the Contract:** Manually copy the `.json` pact file into the provider project (e.g., into `src/test/resources/pacts`).

2. **Add Pact JVM Dependencies (Maven `pom.xml`):**
    ```xml
    <dependency>
        <groupId>au.com.dius.pact.provider</groupId>
        <artifactId>junit5</artifactId>
        <version>4.6.7</version> <!-- Use latest Pact JVM version -->
        <scope>test</scope>
    </dependency>
    <dependency> <!-- If using Spring Boot -->
        <groupId>au.com.dius.pact.provider</groupId>
        <artifactId>spring</artifactId>
        <version>4.6.7</version>
        <scope>test</scope>
    </dependency>
    <dependency> <!-- Needed for JUnit 5 integration -->
        <groupId>org.junit.jupiter</groupId>
        <artifactId>junit-jupiter-engine</artifactId>
        <version>5.9.3</version> <!-- Use compatible JUnit 5 version -->
        <scope>test</scope>
    </dependency>
    <!-- Ensure you have spring-boot-starter-test for Spring Boot testing -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
    ```

    *(Check Maven Central for the absolute latest versions)*

3. **Write the Verification Test (`PetApiProviderTest.java`):**
    This test uses Pact's JUnit 5 support to load the contract and verify it against a running instance of the Spring Boot application.

    ```java
    package com.example.petstore.provider;

    import au.com.dius.pact.provider.junit5.HttpTestTarget;
    import au.com.dius.pact.provider.junit5.PactVerificationContext;
    import au.com.dius.pact.provider.junitsupport.Provider;
    import au.com.dius.pact.provider.junitsupport.State;
    import au.com.dius.pact.provider.junitsupport.loader.PactFolder;
    import au.com.dius.pact.provider.spring.junit5.PactVerificationSpringProvider;
    import org.junit.jupiter.api.BeforeEach;
    import org.junit.jupiter.api.TestTemplate;
    import org.junit.jupiter.api.extension.ExtendWith;
    import org.springframework.boot.test.context.SpringBootTest;
    import org.springframework.boot.test.web.server.LocalServerPort; // Use this for random port

    @SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
    @Provider("petstore-backend") // Matches the provider name in the contract
    @PactFolder("pacts")         // Directory where pact files are located (relative to test resources)
    public class PetApiProviderTest {

        @LocalServerPort
        int randomServerPort; // Inject the random port Spring Boot starts on

        // Configure Pact to target the running Spring Boot application
        @BeforeEach
        void setup(PactVerificationContext context) {
            context.setTarget(new HttpTestTarget("localhost", randomServerPort));
            // For HTTPS: new HttpsTestTarget("localhost", randomServerPort, true) // + Keystore config
        }

        // This test template runs verification for each interaction in the pact file
        @TestTemplate
        @ExtendWith(PactVerificationSpringProvider.class)
        void pactVerificationTestTemplate(PactVerificationContext context) {
            // This triggers Pact to replay the request from the contract
            // and compare the actual response from the provider against the expected response
            context.verifyInteraction();
        }

        // --- State Handlers ---
        // These methods are called by Pact BEFORE replaying an interaction
        // that requires a specific provider state.

        @State("a pet with ID 123 exists") // Matches the 'state' from the consumer test
        public void pet123Exists() {
            // Setup logic: Ensure that when the API receives GET /pets/123,
            // it will find and return the pet "Fido".
            // Examples:
            // - Insert data into an in-memory DB (H2)
            // - Configure mock beans (if using Mockito for dependencies)
            // - Reset state before each state setup if needed
            System.out.println("Provider state setup: Ensuring pet with ID 123 exists.");
            // petRepository.save(new Pet(123L, "Fido", "available")); // Example
        }

        @State("no pets exist") // Example for another interaction (e.g., GET /pets returns empty list)
        public void noPetsExist() {
            System.out.println("Provider state setup: Ensuring no pets exist.");
            // petRepository.deleteAll(); // Example
        }

        // Add more @State methods for other preconditions defined in consumer contracts
    }
    ```

4. **Run Provider Verification:**
    Executing this JUnit test will:
    * Start your Spring Boot application on a random port.
    * Pact locates the `petstore-frontend-petstore-backend.json` file in `src/test/resources/pacts`.
    * For the interaction `a request to fetch pet details for ID 123`:
        * Pact calls the `@State("a pet with ID 123 exists")` method (`pet123Exists`).
        * Pact sends a real HTTP `GET` request to `http://localhost:<randomPort>/pets/123`.
        * Pact compares the actual HTTP response (status, headers, body) from your running application against the `willRespondWith` section defined in the pact file.
    * If the actual response matches the expected response, the test passes. If not, it fails, indicating a contract violation.

**Workflow Without a Broker: Recap**

* **Contract Generation:** Consumer test produces a `.json` file.
* **Contract Sharing:** Manually transfer the file to the provider project.
* **Provider Verification:** Provider test loads the file from its local filesystem.
* **Limitations:** Manual sharing is error-prone and doesn't scale well. There's no central tracking of contract versions or verification results.

This local approach is feasible for small projects or initial adoption, but for larger systems, we need a better way to manage contracts.

## Scaling Up: Using the Pact Broker for Collaboration

The **Pact Broker** is a dedicated application that acts as a central repository for sharing pact files and verification results. It transforms contract testing from a manual file-sharing process into a collaborative, automated workflow.

**Key Benefits of Using a Pact Broker:**

1. **Centralized Contract Repository:** Consumers publish pacts directly to the broker. Providers fetch the contracts they need to verify from the broker. No more manual file transfers!
2. **Decoupled Deployments with Safety:** The broker tracks which versions of consumers and providers are compatible based on successful verifications. This is crucial for independent releases.
3. **Visibility of Verification Results:** Providers publish their verification outcomes back to the broker. Both teams can see the compatibility status (e.g., "Consumer v1.2 contract PASSED verification against Provider v3.4").
4. **Automated Workflows via Webhooks:** Configure the broker to trigger provider builds automatically whenever a consumer publishes a new or updated pact. This ensures immediate feedback on contract changes.
5. **Versioning and Tagging:** Contracts and verification results are versioned. Tags (e.g., `prod`, `staging`, `feat/user-auth`) allow managing contracts across different environments and feature branches.
6. **Network Visualization and Documentation:** The broker UI provides a graph of service interactions and human-readable contract details, acting as live API documentation derived from tests.
7. **Backward Compatibility Checks:** Providers can verify against multiple tagged consumer contracts (e.g., the `prod` version and the latest `dev` version) to ensure non-breaking changes.

**Setting Up:** You can self-host the open-source Pact Broker (e.g., using Docker) or use **PactFlow**, the commercial, fully managed SaaS platform built by the Pact maintainers.

**Typical CI/CD Flow with Pact Broker:**

1. **Consumer CI:**
    * Run consumer contract tests (generates pact file locally).
    * Publish the pact file to the Pact Broker, tagging it with the consumer version and potentially the environment/branch (e.g., `version: 1.2.3`, `tag: prod`).
2. **Provider CI:**
    * (Triggered manually, scheduled, or by webhook) Fetch the relevant pacts from the Broker (e.g., "latest pacts for consumers tagged `prod`" or "latest pact for consumer `petstore-frontend` on branch `main`").
    * Run provider verification against these pacts.
    * Publish verification results back to the Broker, indicating success or failure for the specific provider version and pact version.
3. **Deployment Gate (Optional but Recommended):**
    * Before deploying a service (consumer or provider), use the `can-i-deploy` tool (see next section) to query the Broker: "Is this version compatible with the versions of its dependencies/dependents currently in the target environment (e.g., `prod`)?"

## Managing Contracts Across Environments (Dev, Staging, Prod)

Real-world applications have multiple environments. A provider change deployed to `staging` shouldn't break the `prod` consumer. Pact Broker/PactFlow handles this using **tags** and **environments**.

* **Tags:** Simple labels applied to specific consumer/provider versions (e.g., `prod`, `staging`, `test`, `feat-xyz`). When publishing pacts or results, you include relevant tags. Provider verification can then target pacts with specific tags (e.g., "verify all pacts tagged `prod`").
* **Environments (PactFlow):** A more structured concept in PactFlow, representing deployment environments. You record deployments of service versions to specific environments (e.g., "deployed `petstore-backend` version `2.1.0` to `prod`"). Verification checks can then be tied to these environments.

**Example Scenario:**

1. `petstore-frontend` v1.0 is in `prod`. Its pact is tagged `prod` on the Broker.
2. `petstore-backend` CI pipeline, before deploying to `prod`, fetches and verifies the `petstore-frontend` pact tagged `prod`.
3. `petstore-frontend` team develops v1.1 on branch `feat/new-feature`. They run consumer tests and publish the new pact to the Broker, tagged `feat/new-feature`.
4. `petstore-backend` CI pipeline (perhaps triggered by a webhook) fetches the `feat/new-feature` pact and runs verification.
    * If it passes, great! The backend already supports the new feature's requirements.
    * If it fails, the `petstore-backend` team knows they need to make changes *before* the frontend feature merges and deploys.
5. Once `petstore-frontend` v1.1 is deployed to `prod`, its pact is tagged `prod`. The *next* `petstore-backend` deployment to `prod` will verify against this new `prod` pact.

This mechanism ensures compatibility checks are relevant to the specific stage of the development and deployment lifecycle, enabling safe, independent progression of services.

## Safe Releases with "Can I Deploy" and PactFlow

The **`can-i-deploy`** tool (part of the Pact Broker CLI) is a cornerstone of safe continuous delivery with Pact. It answers the critical question: *"Is it safe to deploy this version of my service to this environment?"*

**How it Works:**

1. You run the command in your CI/CD pipeline *before* deployment.
2. Example: `pact-broker can-i-deploy --pacticipant petstore-backend --version 2.1.0 --to-environment prod`
3. The tool queries the Pact Broker:
    * "For `petstore-backend` version `2.1.0`..."
    * "...find all the contracts (pacts) it needs to fulfill for consumers that are currently deployed in `prod` (or tagged `prod`)."
    * "...check if `petstore-backend` version `2.1.0` has successfully verified *all* of those required pacts."
    * (It also works the other way: a consumer can check if its pact has been verified by the provider version in the target environment).
4. **Result:**
    * If all required verifications are successful -> Exit code 0 (Safe to deploy).
    * If any verification is missing or failed -> Exit code 1 (Do NOT deploy!).

**Benefits:**

* **Automated Safety Gate:** Prevents deploying versions that are known to be incompatible with services already running in the target environment.
* **Eliminates Guesswork:** Replaces manual checks, spreadsheets, or hoping for the best.
* **Increases Deployment Confidence:** Empowers teams to deploy frequently and independently, knowing this check provides a safety net.

**PactFlow** provides a visual representation of this compatibility matrix in its UI, making it easy to see the status across versions and environments, complementing the CLI tool for operational visibility.

## Pact vs. Other Contract Testing Approaches

Pact is excellent, but it's worth knowing the landscape:

1. **Spring Cloud Contract (SCC):**
    * **Focus:** Primarily Java/Spring ecosystem.
    * **Approach:** Often provider-driven or shared-contract (Groovy/YAML DSL). Contracts define stubs (for consumers) and tests (for providers).
    * **Pros:** Deep integration with Spring, auto-generates stubs/tests.
    * **Cons:** Less language-agnostic than Pact. Consumer doesn't *always* drive the contract definition initially.
    * **Choose If:** Your ecosystem is heavily Spring-based, and you prefer contract definitions in DSL over code-generated examples.

2. **OpenAPI/Swagger + Schema Validation:**
    * **Focus:** API design and documentation (schema-first).
    * **Approach:** Define API structure (paths, parameters, request/response schemas) in OpenAPI spec (YAML/JSON). Tools can generate client/server code and validate requests/responses against the schema.
    * **Pros:** Widely adopted standard, great for documentation and code generation, catches basic structural mismatches.
    * **Cons:** **Static contract.** Doesn't verify specific interaction *examples* or guarantee provider implementation matches the spec perfectly in all cases. Doesn't capture *consumer-specific* expectations (e.g., a consumer might only use 3 fields out of 10). Producer/design-driven.
    * **Complementary:** Use OpenAPI for design/docs, use Pact for verifying specific consumer-driven interaction examples against the actual implementation. PactFlow can even compare Pact contracts against OpenAPI specs.

3. **GraphQL:**
    * **Focus:** Strongly typed API queries.
    * **Approach:** Schema is the contract. Introspection allows clients to fetch the schema. Backward compatibility is often handled by deprecating fields rather than removing them.
    * **Pros:** Built-in typing and schema enforcement reduce certain types of contract issues.
    * **Cons:** Doesn't inherently test that resolvers behave as expected for specific query examples. Breaking changes are still possible if not careful.
    * **Pact for GraphQL:** Pact can be used (sometimes via plugins or specific strategies) to test specific GraphQL query/mutation examples between client and server. Tools like Specmatic also target GraphQL contract testing from schemas.

4. **Other Tools:**
    * **Karate DSL:** General-purpose API testing framework that includes contract testing capabilities.
    * **Specmatic:** Uses OpenAPI/GraphQL specs as executable contracts, focusing on spec compliance.

**Choosing the Right Tool:**

* **Polyglot environment?** Pact's language agnosticism is a major advantage.
* **Prioritize consumer needs driving compatibility?** Pact's CDC focus is ideal.
* **Heavily invested in Spring?** Spring Cloud Contract is a strong contender.
* **Need basic schema alignment and docs?** OpenAPI is essential, potentially augmented by Pact or other tools for runtime verification.

## Conclusion: Build Resilient Systems with Confidence

Contract testing with Pact offers a pragmatic and powerful way to tackle the integration challenges inherent in microservice and distributed architectures. By shifting from slow, brittle end-to-end tests to fast, focused contract verification at service boundaries, you gain:

* **Early detection** of integration issues.
* **Faster feedback loops** for developers.
* **Increased confidence** for independent deployments.
* **Living documentation** of API interactions.

We've seen how to implement Pact tests using TypeScript and Java, explored the crucial role of the **Pact Broker** in scaling contract testing through centralized management and automated workflows, and understood how tools like **`can-i-deploy`** provide essential safety gates for CI/CD pipelines.

While alternatives exist, Pact's consumer-driven approach, strong multi-language support, and mature ecosystem (including PactFlow) make it a compelling choice for many teams building modern applications.

Embrace contract testing, reduce your reliance on flaky integration tests, and start deploying your services with greater speed and confidence. Happy contract testing!
