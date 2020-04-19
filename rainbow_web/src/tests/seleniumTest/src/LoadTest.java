
import org.openqa.selenium.By;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.awt.*;
import java.awt.event.KeyEvent;
import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.Set;

public class LoadTest {


    public static void main(String[] args) throws InterruptedException, AWTException {
        ArrayList<String> clients = new ArrayList<String>();

//        clients.add("https://127.0.0.1:8887/en/chat.html?skill=general");
        clients.add("https://127.0.0.1:8887/ms/chat.html?skill=bank_statement");
        clients.add("https://127.0.0.1:8887/ms/chat.html?skill=bank_statement");
        clients.add("https://127.0.0.1:8887/ms/chat.html?skill=bank_statement");

//        clients.add("https://127.0.0.1:8887/en/chat.html?skill=insurance");
//        clients.add("https://127.0.0.1:8887/en/chat.html?skill=fraud");

        System.setProperty("webdriver.gecko.driver","/home/liukaiyu/Application/geckodriver");

        for(int i = 0; i < clients.size() ; i++){
            System.out.println(clients.get(i));
            Worker worker = new Worker(clients.get(i));
            worker.start();
        }

        for(int i = 0; i < clients.size() ; i++){
            System.out.println(clients.get(i));
            Worker worker = new Worker(clients.get(i));
            worker.start();
        }

        for(int i = 0; i < clients.size() ; i++){
            System.out.println(clients.get(i));
            Worker worker = new Worker(clients.get(i));
            worker.start();
        }

        for(int i = 0; i < clients.size() ; i++){
            System.out.println(clients.get(i));
            Worker worker = new Worker(clients.get(i));
            worker.start();
        }

    }
}

class Worker extends Thread {
    private String customer = "";
    WebDriver driver = new FirefoxDriver();

    public Worker (String customer){
        this.customer = customer;
    }

    public void run(){
        System.out.println("opening "+customer);
        driver.get(customer);

        WebDriverWait wait = new WebDriverWait(driver, 1000);
        try {
            Thread.sleep(2000);
            wait.until(ExpectedConditions.elementToBeClickable(By.id("send-button")));
            System.out.println("customer: "+customer+" is served!");
            Thread.sleep(1500);
        } catch (Exception e) {
            System.out.println(e);
        }

        driver.findElement(By.id("exit")).click();
    }
}
