package blog.testforge;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

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

    GoogleSearchSteps gogleSearchSteps;
    GoogleSearchPage googleSearchPage;

    @BeforeEach
    void beforeEach() {
        context = browser.newContext();
        page = context.newPage();
        googleSearchPage = new GoogleSearchPage(page);
        gogleSearchSteps = new GoogleSearchSteps("https://www.google.com/");
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
        var response = gogleSearchSteps.get();
        assertTrue(response.body().asString().length() > 0);
        // UI Test
        googleSearchPage.open();
        assertThat(page).hasTitle("Google");
    }
}