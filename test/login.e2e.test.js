const {test} = require('ava');

const puppeteer = require('puppeteer');

const utilities = require('./helpers/utilities.js');

const baseUrl = 'http://127.0.0.1:8081';

const admin = {
  password: '!1A2b3C4d!',
  username: 'admin',
};
const dummy = {
  password: '!1A2b3C4d',
  username: 'test',
};

let browser;
let page;

let password;
let submitButton;
let username;

/**
 * Initial test set up
 */
test.before(async () => {
  const url = `${baseUrl}/login`;

  browser = await puppeteer.launch({headless: true});
  page = await browser.newPage();

  await page.goto(baseUrl, {waitUntil: 'networkidle2'});
  await page.goto(url, {waitUntil: 'networkidle2'});

  const buttons = await utilities.waitForShadowSelectorAll(
    page,
    'paper-button'
  );
  password = await utilities.waitForShadowSelector(page, '#password');
  submitButton = await page.evaluateHandle((buttons) => buttons[1], buttons);
  username = await utilities.waitForShadowSelector(page, '#username');
});

test.serial('Should verify title', async (t) => {
  const title = await utilities.waitForShadowSelector(page, '.header__title');
  const titleValue = await page.evaluate((title) => title.textContent, title);

  await t.is(titleValue, 'SS Simple Front-end');
});

test.serial(
  'Should not submit when username and password is missing',
  async (t) => {
    await page.evaluate((submitButton) => submitButton.click(), submitButton);

    const passwordInvalid = await page.evaluate(
      (password) => password.invalid,
      password
    );
    const usernameInvalid = await page.evaluate(
      (username) => username.invalid,
      username
    );

    await t.is(passwordInvalid, true);
    await t.is(usernameInvalid, true);
  }
);

test.serial('Should not login when username is incorrect', async (t) => {
  await page.evaluate(
    (password, admin) => {
      password.value = admin['password'];
    },
    password,
    admin
  );
  await page.evaluate(
    (username, dummy) => {
      username.value = dummy['username'];
    },
    username,
    dummy
  );

  await page.evaluate((submitButton) => submitButton.click(), submitButton);
  await page.waitForSelector('paper-toast', {visible: true});

  const toastText = await page.$eval('paper-toast', (el) => el.text);

  await t.is(toastText, 'Invalid credentials, please try again!');
  await page.waitForSelector('paper-toast', {hidden: true});
});

test.serial('Should not login when password is incorrect', async (t) => {
  await page.evaluate(
    (username, admin) => {
      username.value = admin['username'];
    },
    username,
    admin
  );
  await page.evaluate(
    (password, dummy) => {
      password.value = dummy['password'];
    },
    password,
    dummy
  );

  await page.evaluate((submitButton) => submitButton.click(), submitButton);
  await page.waitForSelector('paper-toast', {visible: true});

  const toastText = await page.$eval('paper-toast', (el) => el.text);

  await t.is(toastText, 'Invalid credentials, please try again!');
  await page.waitForSelector('paper-toast', {hidden: true});
});

test.serial('Should successfully login ', async (t) => {
  await page.evaluate(
    (username, admin) => {
      username.value = admin['username'];
    },
    username,
    admin
  );
  await page.evaluate(
    (password, admin) => {
      password.value = admin['password'];
    },
    password,
    admin
  );

  await page.evaluate((submitButton) => submitButton.click(), submitButton);
  await page.waitForNavigation({waitUntil: 'networkidle2'});

  const title = await utilities.waitForShadowSelector(page, '.header__title');
  const titleValue = await page.evaluate((title) => title.textContent, title);

  await t.is(titleValue, 'Dashboard');
});
