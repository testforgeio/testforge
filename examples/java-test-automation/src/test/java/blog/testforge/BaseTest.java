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