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