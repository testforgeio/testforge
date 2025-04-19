---
slug: 002-java-test-automation
title: 'Java Test Automation Framework'
description: 'This document provides an overview of setting up a dedicated test automation framework using Java, Maven, Playwright, and Allure.'
pubDatetime: 2025-03-02T21:17:00Z
ogImage: ../../assets/images/002-java-test-automation.png
featured: false
draft: false
tags:
  - java
  - playwright
  - allure
---

![java-test-automation](@assets/images/002-java-test-automation.png)

Test automation frameworks simplify the process of ensuring your applications work as expected. They help to collaborate with your team and increase confidence in your releases.
In this guide, we'll build a robust dedicated test automation framework using Java, Maven, Playwright, and Allure.
By the end, you'll also learn how to package your tests into a JAR file, and run them in Docker.

## Table of contents

## Install prerequisites

To start building the framework, you need to have [Java](https://openjdk.org/) and [Maven](https://maven.apache.org/) installed on your system.

What Java version to choose? Java follows a six‐month release cycle for its non‐LTS versions, meaning new features and improvements are introduced regularly. However, for a stable test automation framework, you should choose a Long-Term Support (LTS) version like Java 21 or Java 17. Make sure you install OpenJDK(Corretto) instead of Oracle JDK. OpenJDK is an open-source implementation of the Java Platform, Standard Edition, and it is fully compatible with Java specifications. Unlike Oracle JDK, which requires a commercial license for updates, OpenJDK is free to use and receive long-term community support.

Maven is an open-source build automation and project management tool primarily designed for Java-based applications. It streamlines the build process by standardizing the project structure and managing dependencies via the Project Object Model (POM). Install Maven by running the command depending on your operating system.

```bash
# Linux
sudo apt update
sudo apt install openjdk-21-jdk maven

# Mac
brew install openjdk@21 maven

# Windows using https://scoop.sh/
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
scoop bucket add java
scoop install corretto21-jdk  maven
```

Verify the installations by checking the tools version in the command line to confirm they are ready for use.

```bash
$ java --version
openjdk 21.0.6 2025-01-21
OpenJDK Runtime Environment (build 21.0.6+7-Ubuntu-124.04.1)
OpenJDK 64-Bit Server VM (build 21.0.6+7-Ubuntu-124.04.1, mixed mode, sharing)
$ mvn --version
Apache Maven 3.8.7
Maven home: /usr/share/maven
Java version: 21.0.6, vendor: Ubuntu, runtime: /usr/lib/jvm/java-21-openjdk-amd64
Default locale: en, platform encoding: UTF-8
OS name: "linux", version: "5.15.167.4-microsoft-standard-wsl2", arch: "amd64", family: "unix"
```

## Create Maven Project

Let's create a new project using archetype. Maven archetypes are predefined project templates that facilitate the rapid creation of new projects with standardized structures and configurations. They ensure consistency across projects and promote adherence to best practices.

We can use `maven-archetype-quickstart` archetype to set up a basic project with a standard directory layout and a sample `pom.xml` file.
Usually the `groupId` is reversed domain name of your company, `artifactId` is the name of your project.

```bash
mvn archetype:generate -DgroupId=blog.testforge -DartifactId=java-test-automation -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
```

Generated project structure.

```text
playwright
├─ src
│  ├─ main
│  │  └─ java
│  │     └─ blog
│  │        └─ testforge
│  │           └─ App.java
│  └─ test  
│     └─ java
│        └─ blog
│           └─ testforge
│              └─ AppTest.java
└─ pom.xml
```

Specify compiler encoding, source and target java version and run test goal to verify the project is set up correctly.

```diff
  <name>java-test-automation</name>
  
+  <properties>
+    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
+    <maven.compiler.source>21</maven.compiler.source>
+    <maven.compiler.target>21</maven.compiler.target>
+  </properties>

  <dependencies>
```

```bash
$ cd java-test-automation
$ mvn test
...
Results :

Tests run: 1, Failures: 0, Errors: 0, Skipped: 0

[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  0.633 s
[INFO] Finished at: 2025-03-02T16:54:53+02:00
[INFO] ------------------------------------------------------------------------
```

## Add dependencies

Our framework will provide both frontend and backend testing capabilities. We've selected popular libraries to streamline test development, but you can choose alternative tools based on your team's experience and preferences. Our stack includes browser automation, HTTP client, assertion library, test runner, and test reporter.

### Playwright

[Playwright for Java](https://playwright.dev/java/) is our choice for web automation. It is a robust library designed for end-to-end testing and automation across modern web browsers, including Chromium, Firefox, and WebKit. It offers a unified API that supports multiple platforms—Windows, Linux, and macOS—and integrates seamlessly with Java applications.

```diff
<dependencies>
+  <dependency>
+    <groupId>com.microsoft.playwright</groupId>
+    <artifactId>playwright</artifactId>
+    <version>1.49.0</version>
+  </dependency>
```

### RestAssured

For API testing, we use [RestAssured](https://rest-assured.io/). Its fluent and intuitive API is tailored for testing, simplifying HTTP requests, response handling, and assertions with minimal boilerplate code.

```diff
<dependencies>
  <dependency>
    <groupId>com.microsoft.playwright</groupId>
    <artifactId>playwright</artifactId>
    <version>1.49.0</version>
  </dependency>
+  <dependency>
+    <groupId>io.rest-assured</groupId>
+    <artifactId>rest-assured</artifactId>
+    <version>5.5.1</version>
+  </dependency>
```

### Logging

We use [Logback](https://logback.qos.ch/) for logging in our test automation framework. It offers a flexible and efficient logging solution, compatible with SLF4J, and provides various output options including console and file appenders. Logback supports different logging levels such as trace, debug, info, warn, and error, allowing for fine-grained control over log output.

```diff
<dependencies>
  <dependency>
    <groupId>io.rest-assured</groupId>
    <artifactId>rest-assured</artifactId>
    <version>5.5.1</version>
  </dependency>
+  <dependency>
+    <groupId>org.slf4j</groupId>
+    <artifactId>slf4j-api</artifactId>
+    <version>2.0.17</version>
+  </dependency>
+  <dependency>
+    <groupId>ch.qos.logback</groupId>
+    <artifactId>logback-classic</artifactId>
+    <version>1.5.17</version>
```

### JUnit 5

We've chosen [JUnit 5](https://junit.org/junit5/) as our test runner. While [TestNG](https://testng.org/) was a popular choice before JUnit 5, the latest version of JUnit offers comparable features, is more familiar to developers, and has a larger community (6.5k stars vs 2k stars on GitHub).

Dependency Management `junit-bom` (Bill of Materials) import ensures that all JUnit libraries are compatible and use the same version across your project, eliminating any potential version mismatch issues.

Starting with version 2.22.0, the Maven Surefire Plugin provides native support for running JUnit 5 tests. This means that, by default, if you include JUnit 5 dependencies in your project, the Surefire Plugin will automatically detect and execute them without the need for additional configuration.

```diff
  </properties>

+  <dependencyManagement>
+    <dependencies>
+       <dependency>
+         <groupId>org.junit</groupId>
+         <artifactId>junit-bom</artifactId>
+         <version>5.12.0</version>
+         <type>pom</type>
+         <scope>import</scope>
+       </dependency>
+     </dependencies>
+  </dependencyManagement>

  </dependencies>
  ...
+    <dependency>
+      <groupId>org.junit.jupiter</groupId>
+      <artifactId>junit-jupiter</artifactId>
+    </dependency>
  </dependencies>

+  <build>
+    <plugins>
+      <plugin>
+        <artifactId>maven-surefire-plugin</artifactId>
+        <version>3.5.2</version>
+      </plugin>
+    </plugins>
+  </build>
</project>
```

You can remove `junit` dependency added by Maven archetype and update AppTest.java imports to use JUnit 5.

- `pom.xml`

  ```diff
  <dependencies>
  -  <dependency>
  -    <groupId>org.junit</groupId>
  -    <artifactId>junit</artifactId>
  -    <version>3.8.1</version>
  -    <scope>test</scope>
  -  </dependency>
  </dependencies>
  ```

- `src/test/java/blog/testforge/AppTest.java`

  ```java
  package blog.testforge;

  import static org.junit.jupiter.api.Assertions.assertEquals;

  import org.junit.jupiter.api.Test;


  class AppTest {
      
      @Test
      void testApp() {
          assertEquals(true, true);
      }
  }
  ```

### Allure

[Allure Report](https://allurereport.org/) serves as our test reporter, offering flexible and visually appealing reports for test executions.

```diff
  <dependencyManagement>
    <dependencies>
    ...
+      <dependency>
+        <groupId>io.qameta.allure</groupId>
+        <artifactId>allure-bom</artifactId>
+        <version>2.25.0</version>
+        <type>pom</type>
+        <scope>import</scope>
+      </dependency>
    </dependencies>
  </dependencyManagement>

  <dependencies>
  ...
+    <dependency>
+      <groupId>io.qameta.allure</groupId>
+      <artifactId>allure-junit5</artifactId>
+    </dependency>
</dependencies>
```

Allure utilizes AspectJ to enhance its reporting capabilities, particularly for features like `@Step` and `@Attachment` annotations. AspectJ enables aspect-oriented programming, allowing Allure to intercept and process annotated methods during test execution, thereby enriching the generated reports with detailed step and attachment information.

```diff
  <properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <maven.compiler.source>21</maven.compiler.source>
    <maven.compiler.target>21</maven.compiler.target>
+    <aspectj.version>1.9.21</aspectj.version>
  </properties>
  
  ...
  
  <build>
    <plugins>
      <plugin>
        <artifactId>maven-surefire-plugin</artifactId>
        <version>3.5.2</version>
+        <configuration>
+          <argLine>
+            -javaagent:"${settings.localRepository}/org/aspectj/aspectjweaver/${aspectj.version}/aspectjweaver-${aspectj.version}.jar"
+          </argLine>
+        </configuration>
+        <dependencies>
+          <dependency>
+            <groupId>org.aspectj</groupId>
+            <artifactId>aspectjweaver</artifactId>
+            <version>${aspectj.version}</version>
+          </dependency>
+        </dependencies>
      </plugin>
    </plugins>
  </build>
```

Install dependencies and run the test

```bash
mvn clean test
```

## Add Steps and Tests

A common practice is to add Page Objects, API steps, and helpers to `main/java` directory and use them in your tests. Let's create a simple test class to ensure your framework works correctly.

### PageObject

`src/main/java/blog/testforge/GoogleSearchPage.java`

```java
package blog.testforge;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;

import io.qameta.allure.Step;

public class GoogleSearchPage {

    private final Page page;

    public GoogleSearchPage(Page page) {
        this.page = page;
    }

    public void open() {
        page.navigate("https://www.google.com");
    }

    @Step
    public Locator searchResults(String query) {
        page.locator("textarea[name='q']").fill(query);
        page.locator("textarea[name=q]").press("Enter");
        return page.locator("div.g");
    }
}
```

### API step

`src/main/java/blog/testforge/GoogleSearchSteps.java`

```java
package blog.testforge;

import static io.restassured.RestAssured.given;

import io.qameta.allure.Step;
import io.restassured.builder.RequestSpecBuilder;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;

public class GoogleSearchSteps {

  private RequestSpecification requestSpec;

  public GoogleSearchSteps() {
    this("https://www.google.com/");
  }

  public GoogleSearchSteps(String baseUri) {
    this.requestSpec = new RequestSpecBuilder()
        .setBaseUri(baseUri)
        .build();
  }

  public Response get() {
    return get("/");
    
  }

  @Step
  public Response get(String endpoint) {
    return given()
        .spec(requestSpec)
        .when()
        .get(endpoint)
        .then()
        .statusCode(200)
        .extract()
        .response();
  }
}
```

### BaseTest

PageObject and Steps classes should contain only methods that you are going to reuse frequently. All other test code should be placed in Test files to reduce unnecessary abstractions.

In order to run Playwright Tests in parallel we need to ensure thread safety. `BaseTest` creates a separate Playwright instance for each test class.

`src/test/java/blog/testforge/BaseTest.java`

```java
package blog.testforge;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.TestInstance;

import com.microsoft.playwright.Browser;
import com.microsoft.playwright.BrowserContext;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class BaseTest {

    Playwright playwright;
    Browser browser;
    BrowserContext context;
    Page page;

    @BeforeAll
    void beforeAll() {
        playwright = Playwright.create();
        browser = playwright.chromium().launch();
    }

    @AfterAll
    void afterAll() {
        playwright.close();
    }
}
```

### TestClass

Particular test class extends BaseTest and can access browser to create a page.

`src/test/java/blog/testforge/AppTest.java`

```java
package blog.testforge;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import io.qameta.allure.Description;
import io.qameta.allure.Issue;
import io.qameta.allure.Owner;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import io.qameta.allure.TmsLink;

public class AppTest extends BaseTest {

    GoogleSearchSteps googleSearchSteps;
    GoogleSearchPage googleSearchPage;

    @BeforeEach
    void beforeEach() {
        context = browser.newContext();
        page = context.newPage();
        googleSearchPage = new GoogleSearchPage(page);
        googleSearchSteps = new GoogleSearchSteps("https://www.google.com/");
    }

    @AfterEach
    void afterEach() {
        context.close();
    }

    @Test
    @DisplayName("Test Google Search")
    @Description("Test description")
    @Severity(SeverityLevel.CRITICAL)
    @Owner("Test Owner")
    @Issue("AUTH-123")
    @TmsLink("TMS-456")
    void testGoogleSearch() {
        // API Test
        var response = googleSearchSteps.get();
        assertTrue(response.body().asString().length() > 0);
        // UI Test
        googleSearchPage.open();
        assertThat(page).hasTitle("Google");
    }
}
```

## Package Executable JAR

With the above configuration you already can run tests using maven surefire plugin `mvn test`. But this task involves downloading project dependencies and compiling java classes. If you want to speed up this process in CI or be able to run tests in standalone mode you need to prepare an executable jar file. The executable jar bundles all dependencies into a single file. This allows for easy execution.

Add [Maven Assembly Plugin](https://maven.apache.org/plugins/maven-assembly-plugin/index.html) descriptor.

`src/assembly/executable.xml`

```xml
<assembly
  xmlns="http://maven.apache.org/plugins/maven-assembly-plugin/assembly/1.1.3"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/plugins/maven-assembly-plugin/assembly/1.1.3 http://maven.apache.org/xsd/assembly-1.1.3.xsd">
  <id>executable</id>
  <formats>
    <format>jar</format>
  </formats>
  <includeBaseDirectory>false</includeBaseDirectory>
  <dependencySets>
    <dependencySet>
      <outputDirectory>/</outputDirectory>
      <useProjectArtifact>true</useProjectArtifact>
      <unpack>true</unpack>
      <scope>test</scope>
      <unpackOptions>
        <excludes>
          <exclude>META-INF/*.SF</exclude>
          <exclude>META-INF/*.DSA</exclude>
          <exclude>META-INF/*.RSA</exclude>
        </excludes>
      </unpackOptions>
    </dependencySet>
  </dependencySets>
  <fileSets>
    <fileSet>
      <directory>${project.build.directory}/test-classes</directory>
      <outputDirectory>/</outputDirectory>
      <includes>
        <include>**/*</include>
      </includes>
      <useDefaultExcludes>true</useDefaultExcludes>
    </fileSet>
  </fileSets>
</assembly>
```

Add junit console launcher dependency and assembly plugin configuration.

`pom.xml`

```xml
  </dependencies>
  ...
    </dependency>
      <groupId>org.junit.jupiter</groupId>
      <artifactId>junit-jupiter</artifactId>
    </dependency>
+    <dependency>
+      <groupId>org.junit.platform</groupId>
+      <artifactId>junit-platform-console</artifactId>
+    </dependency>  
  </dependencies>
  ...
    </plugins>
    ...
+      <plugin>
+        <artifactId>maven-assembly-plugin</artifactId>
+        <version>3.7.1</version>
+        <configuration>
+          <descriptors>
+            <descriptor>
+              src/assembly/executable.xml</descriptor>
+          </descriptors>
+          <archive>
+            <manifest>
+              <mainClass>org.junit.platform.console.ConsoleLauncher</mainClass>
+            </manifest>
+          </archive>
+        </configuration>
+        <executions>
+          <execution>
+            <id>make-assembly</id>
+            <phase>package</phase>
+            <goals>
+              <goal>single</goal>
+            </goals>
+          </execution>
+        </executions>
+      </plugin>
    </plugins>
```

Package the JAR. We skip tests because we don't need them for this step.

```bash
mvn clean package -DskipTests
```

You can test the executable JAR file.

```bash
java -jar target/java-test-automation-1.0-SNAPSHOT-executable.jar execute -p blog.testforge --details verbose --fail-if-no-tests
```

Create Docker container

Run your tests in a Docker container for consistent environments.

`Dockerfile`

```dockerfile
FROM openjdk:21
WORKDIR /app
COPY target/java-test-automation-*-executable.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar", "execute"]
```

Build and run the container

```bash
docker build -t testframework .
docker run testframework -p blog.testforge
```

## Conclusion

By following this guide, you now have a fully functional test automation framework.
From writing tests to executing them in Docker, you’re equipped with the tools to handle various testing scenarios.
Check out example project with the tests [here](https://github.com/testforgeio/testforge/tree/main/examples/java-test-automation).
