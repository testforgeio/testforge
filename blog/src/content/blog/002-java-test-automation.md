---
title: 'Java test automation framework'
description: 'This document provides an overview and detailed description of the Java Test Automation Framework'
pubDate: 'Jul 23 2024'
heroImage: '/blog-002-java-test-automation.png'
---

# Java test automation framework

# **Setting Up a Test Automation Framework in Java with Maven, Selenide, Allure, and JAR Packaging**

Test automation frameworks simplify the process of ensuring your applications work as expected. In this guide, we’ll build a robust test automation framework using Java, Maven, Selenide, and Allure. By the end, you’ll also learn how to package your tests into a JAR file, run them in Docker, and configure a remote browser.

# **Table of Contents**

1.	**Introduction**

2.	**Create Maven Project**

3.	**Add Dependencies**

4.	**Add Steps and Tests**

5.	**Add Reporter**

6.	**Package Fat JAR**

7.	**Execute from Docker**

8.	**Bonus: Use Remote Browser**

# **1. Introduction**

Automating web application testing is crucial for modern development workflows. Selenide simplifies browser automation, Allure generates detailed reports, and Maven manages dependencies and build processes. This article will walk you through building and running a test framework efficiently.

# **2. Create Maven Project**

# **Steps to create a Maven project:**

1.	Open your IDE (e.g., IntelliJ IDEA or Eclipse).

2.	Create a new Maven project:

•	Use the maven-archetype-quickstart archetype.

3.	Define groupId and artifactId (e.g., com.example.testframework).

# **Example pom.xml snippet:**

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"

xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">

<modelVersion>4.0.0</modelVersion>

<groupId>com.example</groupId>

<artifactId>testframework</artifactId>

<version>1.0-SNAPSHOT</version>

<build>

<plugins>

*<!-- Add Maven plugins here -->*

</plugins>

</build>

</project>
```

# **3. Add Dependencies**

Add the necessary dependencies for Selenide, Allure, and other tools in your pom.xml file.

# **Example pom.xml dependencies:**

<dependencies>

*<!-- Selenide -->*

<dependency>

<groupId>com.codeborne</groupId>

<artifactId>selenide</artifactId>

<version>6.16.0</version>

</dependency>

*<!-- TestNG -->*

<dependency>

<groupId>org.testng</groupId>

<artifactId>testng</artifactId>

<version>7.7.0</version>

<scope>test</scope>

</dependency>

*<!-- Allure TestNG -->*

<dependency>

<groupId>io.qameta.allure</groupId>

<artifactId>allure-testng</artifactId>

<version>2.21.0</version>

</dependency>

</dependencies>

# **4. Add Steps and Tests**

Create a simple test class to ensure your framework works correctly.

# **Example test class:**

import com.codeborne.selenide.Selenide;

import org.testng.annotations.Test;

import static com.codeborne.selenide.Selenide.*;

import static com.codeborne.selenide.Condition.text;

public class GoogleSearchTest {

@Test

public void searchInGoogle() {

open("https://google.com");

$("input[name='q']").setValue("Selenide").pressEnter();

$("#search").shouldHave(text("selenide.org"));

}

}

# **5. Add Reporter**

Allure provides a visual way to review test results. Add the Allure TestNG listener to your tests.

# **Add Allure configuration:**

1.	Add the listener in your testng.xml file:

<suite name="Test Suite">

<listeners>

<listener class-name="io.qameta.allure.testng.AllureTestNg" />

</listeners>

<test name="Google Tests">

<classes>

<class name="com.example.GoogleSearchTest" />

</classes>

</test>

</suite>

2.	Add Maven plugin for Allure:

<plugin>

<groupId>io.qameta.allure</groupId>

<artifactId>allure-maven</artifactId>

<version>2.11.2</version>

</plugin>

Generate the Allure report:

mvn allure:serve

# **6. Package Fat JAR**

A “fat JAR” bundles all dependencies into a single JAR file. This allows for easy execution.

# **Configure Maven’s shade plugin:**

<build>

<plugins>

<plugin>

<groupId>org.apache.maven.plugins</groupId>

<artifactId>maven-shade-plugin</artifactId>

<version>3.4.1</version>

<executions>

<execution>

<phase>package</phase>

<goals>

<goal>shade</goal>

</goals>

</execution>

</executions>

</plugin>

</plugins>

</build>

# **Package the JAR:**

mvn clean package

# **7. Execute from Docker**

Run your tests in a Docker container for consistent environments.

# **Dockerfile:**

FROM openjdk:17

WORKDIR /app

COPY target/testframework-1.0-SNAPSHOT.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]

# **Build and run the container:**

docker build -t testframework .

docker run testframework

# **8. Bonus: Use Remote Browser**

You can use a remote browser (e.g., Selenium Grid) for executing tests.

# **Configure Selenide for a remote browser:**

import static com.codeborne.selenide.Configuration.*;

public class RemoteSetup {

public static void setup() {

remote = "http://<selenium-grid-ip>:4444/wd/hub";

browser = "chrome";

startMaximized = true;

}

}

# **Start Selenium Grid:**

docker run -d -p 4444:4444 --name selenium-hub selenium/hub

docker run -d --link selenium-hub:hub selenium/node-chrome

# **Conclusion**

By following this guide, you now have a fully functional test automation framework. From writing tests to executing them in Docker with remote browser configurations, you’re equipped with the tools to handle various testing scenarios.