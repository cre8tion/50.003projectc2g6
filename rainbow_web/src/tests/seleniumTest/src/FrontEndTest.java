
import org.openqa.selenium.By;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public class FrontEndTest {

    static String en = "https://127.0.0.1:8887/en/index.html";
    static String zh = "https://127.0.0.1:8887/zh/index.html";
    static String ms = "https://127.0.0.1:8887/ms/index.html";

    static void checkByLinkText(WebDriver driver, String linkText) throws InterruptedException {
        driver.findElement(By.linkText(linkText)).click();
        Thread.sleep(1500);
        driver.navigate().back();
        Thread.sleep(1500);
    }

    static void checkByClassName(WebDriver driver, String callName) throws InterruptedException {
        driver.findElement(By.className(callName)).click();
        Thread.sleep(1500);
        driver.navigate().back();
        Thread.sleep(1500);
    }

    static void navigateFourBlocks (WebDriver driver) throws InterruptedException {
        checkByClassName(driver, "blockgeneral");
        checkByClassName(driver, "blockbankstatement");
        checkByClassName(driver, "blockinsurance");
        checkByClassName(driver, "blockfraud");
    }

    static void navigateSupports (WebDriver driver) throws InterruptedException {
        driver.findElement(By.className("blockchat")).click();
        Thread.sleep(1500);
        navigateFourBlocks(driver);
        driver.navigate().back();
        Thread.sleep(1500);

        driver.findElement(By.className("blockcall")).click();
        Thread.sleep(1500);
        navigateFourBlocks(driver);
        driver.navigate().back();
        Thread.sleep(1500);
    }

    public static void main(String[] args) throws InterruptedException {

        System.setProperty("webdriver.gecko.driver","/home/liukaiyu/Application/geckodriver");
        WebDriver driver = new FirefoxDriver();
//        System.setProperty("webdriver.chrome.driver","/home/liukaiyu/Application/chromedriver");
//        WebDriver driver = new ChromeDriver();

        // EN version
        driver.get(en);
        Thread.sleep(2000);

        checkByLinkText(driver, "About Us");
        checkByLinkText(driver, "Support");
        checkByLinkText(driver, "FAQ");

        // Navigate support page
        driver.findElement(By.linkText("Support")).click();
        Thread.sleep(1500);
        navigateSupports(driver);
        driver.navigate().back();


        // ZH version
        driver.navigate().to(zh);
        Thread.sleep(2000);

        checkByLinkText(driver, "关于我们");
        checkByLinkText(driver, "联系客服");
        checkByLinkText(driver, "FAQ");

        // Navigate support page
        driver.findElement(By.linkText("联系客服")).click();
        Thread.sleep(1500);
        navigateSupports(driver);
        driver.navigate().back();


        // MS version
        driver.navigate().to(ms);
        Thread.sleep(2000);

        checkByLinkText(driver, "Mengenai Kami");
        checkByLinkText(driver, "Hubungi Kami");
        checkByLinkText(driver, "Soalan Lazim");

        // Navigate support page
        driver.findElement(By.linkText("Hubungi Kami")).click();
        Thread.sleep(1500);
        navigateSupports(driver);
        driver.navigate().back();
    }
}
