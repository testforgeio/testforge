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