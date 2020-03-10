const { Builder, By, Key, until } = require('selenium-webdriver');
require('selenium-webdriver/chrome');
require('selenium-webdriver/firefox');
require('chromedriver');
require('geckodriver');
const { querySelector } = require('./helpers');


const rootURL = 'https://www.mozilla.org/en-US/';
let driver;

beforeAll(async () => {
  driver = await new Builder().forBrowser('firefox').build()
});

afterAll(async () => driver.quit());

it('initialises the context', async () => {
  await driver.get(rootURL)
});

it('should click on navbar button to display a drawer', async () => {
  const anchor = await querySelector('[href=\'/en-US/firefox/\']', driver);
  const actual = await anchor.getText();
  const expected = 'Firefox';
  expect(actual).toEqual(expected)
});
