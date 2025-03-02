FROM openjdk:21
WORKDIR /app
COPY target/java-test-automation-*-executable.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]