const {test} = require('ava');

const puppeteer = require('puppeteer');

const project = require('./helpers/project.js');
const utilities = require('./helpers/utilities.js');

const baseUrl = 'http://127.0.0.1:8081';

const admin = {
  password: '!1A2b3C4d!',
  username: 'admin',
};

let browser;
let page;

/**
 * Initial test set up
 */
test.before(async () => {
  const url = `${baseUrl}/dashboard`;

  browser = await puppeteer.launch({headless: true});
  page = await browser.newPage();

  await page.goto(baseUrl, {waitUntil: 'networkidle2'});
  await project.signIn(page, admin['username'], admin['password']);
  await page.goto(url, {waitUntil: 'networkidle2'});
});

test.serial('Should verify title', async (t) => {
  const title = await utilities.waitForShadowSelector(page, '.header__title');
  const titleValue = await page.evaluate((title) => title.textContent, title);

  await t.is(titleValue, 'Dashboard');
});
