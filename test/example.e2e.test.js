const {test} = require('ava');

const isBefore = require('date-fns/isBefore');

const path = require('path');

const puppeteer = require('puppeteer');

const project = require('./helpers/project.js');
const utilities = require('./helpers/utilities.js');

const baseUrl = 'http://127.0.0.1:8081';

const admin = {
  password: '!1A2b3C4d!',
  username: 'admin',
};

const imagePathA = path.resolve(__dirname, './images/image1.png');
const imagePathB = path.resolve(__dirname, './images/image2.png');
const imagePathC = path.resolve(__dirname, './images/image3.png');

let browser;
let page;

let file;
let name;

let clear;
let submit;

let spinner;

/**
 * Create example
 * @async
 * @param {string} nameValue
 * @param {string} imagePath
 */
const createExample = async (nameValue, imagePath) => {
  await page.evaluate(
    (name, nameValue) => {
      name.value = nameValue;
    },
    name,
    nameValue
  );
  await file.uploadFile(imagePath);

  await page.evaluate((submit) => submit.click(), submit);
  await page.waitForSelector('paper-toast', {visible: true});
  await page.waitForSelector('paper-toast', {hidden: true});
};

/**
 * Delete example
 * @async
 */
const deleteExample = async () => {
  const deleteButton = await utilities.shadowSelector(
    page,
    'paper-icon-button[icon="delete"]'
  );

  await page.evaluate((deleteButton) => deleteButton.click(), deleteButton);

  const yesButton = await page.evaluateHandle(
    `document.querySelector('#dialogConfirm').querySelector('paper-button[data-option="yes"]')`
  );

  await page.evaluate((yesButton) => yesButton.click(), yesButton);
  await page.waitForSelector('paper-toast', {visible: true});
  await page.waitForSelector('paper-toast', {hidden: true});
};

test.before(async () => {
  const url = `${baseUrl}/example`;

  browser = await puppeteer.launch({headless: true});
  page = await browser.newPage();

  await page.goto(baseUrl, {waitUntil: 'networkidle2'});
  await project.signIn(page, admin['username'], admin['password']);
  await page.goto(url, {waitUntil: 'networkidle2'});

  file = await utilities.waitForShadowSelector(page, '#file');
  name = await utilities.waitForShadowSelector(page, '#name');

  clear = await utilities.waitForShadowSelector(page, '#clear');
  submit = await utilities.waitForShadowSelector(page, '#submit');

  spinner = await utilities.waitForShadowSelector(page, '#spinner');
});

test.serial('Should verify title', async (t) => {
  const titleElement = await utilities.shadowSelector(page, '.header__title');
  const title = await page.evaluate(
    (titleElement) => titleElement.textContent,
    titleElement
  );

  await t.is(title, 'Example');
});

test.serial('Should create example successfully', async (t) => {
  await page.evaluate((name) => {
    name.value = 'Alpha';
  }, name);
  await file.uploadFile(imagePathA);
  await page.evaluate((submit) => submit.click(), submit);
  await page.waitForSelector('paper-toast', {visible: true});

  const toastText = await page.$eval('paper-toast', (el) => el.text);

  await t.is(toastText, 'Example created successfully.');
  await page.waitForSelector('paper-toast', {hidden: true});

  const editButtons = await utilities.shadowSelectorAll(
    page,
    'paper-icon-button[icon="editor:mode-edit"]'
  );
  const numOfExamples = await page.evaluate(
    (editButtons) => editButtons.length,
    editButtons
  );

  await t.is(numOfExamples, 1);
});

test.serial('Should read example successfully', async (t) => {
  const tableRows = await utilities.shadowSelectorAll(page, '.table__row');
  const numOfExamples = await page.evaluate(
    (tableRows) => tableRows.length,
    tableRows
  );

  await t.is(numOfExamples, 1);
});

test.serial('Should change submit button text when in edit mode', async (t) => {
  const editButton = await utilities.shadowSelector(
    page,
    'paper-icon-button[icon="editor:mode-edit"]'
  );

  await page.evaluate((editButton) => editButton.click(), editButton);

  const buttonText = await page.evaluate(
    (submit) => submit.textContent.trim(),
    submit
  );

  await t.is(buttonText, 'edit');
});

test.serial('Should clear form successfully', async (t) => {
  await page.evaluate((clear) => clear.click(), clear);

  const fileValidity = await page.evaluate((file) => file.validity.valid, file);
  const nameValue = await page.evaluate((name) => name.value, name);
  const numOfFiles = await page.evaluate((file) => file.files.length, file);

  await t.is(fileValidity, false);
  await t.is(nameValue, undefined);
  await t.is(numOfFiles, 0);
});

test.serial('Should contain the correct id in the modal', async (t) => {
  const tableCellIds = await utilities.shadowSelectorAll(
    page,
    '.table__cell--id'
  );
  const tableCellId = await page.evaluate(
    (tableCellIds) => tableCellIds[1].textContent,
    tableCellIds
  );
  const deleteButton = await utilities.shadowSelector(
    page,
    'paper-icon-button[icon="delete"]'
  );

  await page.evaluate((deleteButton) => deleteButton.click(), deleteButton);

  const modalMessage = await page.evaluateHandle(
    `document.querySelector('#dialogConfirm').querySelector('p').querySelector('strong')`
  );
  const modalId = await page.evaluate(
    (modalMessage) => modalMessage.textContent.split('#')[1],
    modalMessage
  );

  await t.is(tableCellId, modalId);

  const noButton = await page.evaluateHandle(
    `document.querySelector('#dialogConfirm').querySelector('paper-button[data-option="no"]')`
  );

  await page.evaluate((noButton) => noButton.click(), noButton);
});

test.serial('Should update example name successfully', async (t) => {
  const editButton = await utilities.shadowSelector(
    page,
    'paper-icon-button[icon="editor:mode-edit"]'
  );

  await page.evaluate((editButton) => editButton.click(), editButton);
  await page.evaluate((name) => {
    name.value = 'Beta';
  }, name);
  await page.evaluate((submit) => submit.click(), submit);
  await page.waitForSelector('paper-toast', {visible: true});

  const toastText = await page.$eval('paper-toast', (el) => el.text);

  await t.is(toastText, 'Example updated successfully.');
  await page.waitForSelector('paper-toast', {hidden: true});
});

test.serial('Should update example image successfully', async (t) => {
  const editButton = await utilities.shadowSelector(
    page,
    'paper-icon-button[icon="editor:mode-edit"]'
  );

  await page.evaluate((editButton) => editButton.click(), editButton);
  await file.uploadFile(imagePathB);
  await page.evaluate((submit) => submit.click(), submit);
  await page.waitForSelector('paper-toast', {visible: true});

  const toastText = await page.$eval('paper-toast', (el) => el.text);

  await t.is(toastText, 'Example updated successfully.');
  await page.waitForSelector('paper-toast', {hidden: true});
});

test.serial('Should not create example with duplicated name', async (t) => {
  await page.evaluate((name) => {
    name.value = 'Beta';
  }, name);
  await page.evaluate((submit) => submit.click(), submit);

  const namePath = await page.evaluate(
    (name) => name.getAttribute('data-path'),
    name
  );

  const nameError = `${namePath}.shadowRoot.querySelector('paper-input-container').querySelector('paper-input-error')`;

  await page.waitForFunction(nameError);

  const error = await page.evaluateHandle(nameError);
  const errorText = await page.evaluate((error) => error.textContent, error);

  await t.is(errorText, 'Must be unique.');
  await page.evaluate((clear) => clear.click(), clear);
});

test.serial('Should delete example successfully', async (t) => {
  const deleteButton = await utilities.shadowSelector(
    page,
    'paper-icon-button[icon="delete"]'
  );

  await page.evaluate((deleteButton) => deleteButton.click(), deleteButton);

  const yesButton = await page.evaluateHandle(
    `document.querySelector('#dialogConfirm').querySelector('paper-button[data-option="yes"]')`
  );

  await page.evaluate((yesButton) => yesButton.click(), yesButton);
  await page.waitForSelector('paper-toast', {visible: true});

  const toastText = await page.$eval('paper-toast', (el) => el.text);

  await t.is(toastText, 'Example deleted successfully.');
  await page.waitForSelector('paper-toast', {hidden: true});
});

test.serial('Should not create exmaple without name', async (t) => {
  await page.evaluate((name) => {
    name.value = '';
  }, name);
  await file.uploadFile(imagePathA);
  await page.evaluate((submit) => submit.click(), submit);

  const nameInvalid = await page.evaluate((name) => name.invalid, name);

  await t.is(nameInvalid, true);
});

test.serial('Should not create example without image', async (t) => {
  await page.evaluate((clear) => clear.click(), clear);
  await page.evaluate((name) => {
    name.value = 'Alpha';
  }, name);
  await page.evaluate((submit) => submit.click(), submit);

  const fileValidity = await page.evaluate((file) => file.validity.valid, file);
  const numOfFiles = await page.evaluate((file) => file.files.length, file);

  await t.is(fileValidity, false);
  await t.is(numOfFiles, 0);
});

test.serial('Should not allow oversized image', async (t) => {
  await page.evaluate((clear) => clear.click(), clear);
  await file.uploadFile(imagePathC);

  const uploadButtonError = await utilities.waitForShadowSelector(
    page,
    '.upload__button--error'
  );

  const errorColor = await page.evaluate(
    (uploadButtonError) =>
      window.getComputedStyle(uploadButtonError).getPropertyValue('color'),
    uploadButtonError
  );

  await t.is(errorColor, 'rgb(221, 44, 0)');
});

test.serial('Should sort data with id', async (t) => {
  await page.evaluate((clear) => clear.click(), clear);

  await createExample('Alpha', imagePathA);
  await createExample('Beta', imagePathB);

  const sortButton = await utilities.shadowSelector(page, '.table__cell--id');

  await page.evaluate((sortButton) => sortButton.click(), sortButton);

  await page.waitForFunction(
    (spinner) => spinner.active === false,
    {},
    spinner
  );

  const tableCellIds = await utilities.shadowSelectorAll(
    page,
    '.table__cell--id'
  );
  const id1 = await page.evaluate(
    (tableCellIds) => tableCellIds[1].textContent,
    tableCellIds
  );
  const id2 = await page.evaluate(
    (tableCellIds) => tableCellIds[2].textContent,
    tableCellIds
  );

  await t.is(Number(id1) < Number(id2), true);
});

test.serial('Should sort data with name', async (t) => {
  const columnSort = await utilities.shadowSelectorAll(
    page,
    '.table__cell--sort'
  );

  const nameSort = await page.evaluateHandle(
    (columnSort) => columnSort[1],
    columnSort
  );

  await page.evaluate((nameSort) => nameSort.click(), nameSort);

  await page.waitForFunction(
    (spinner) => spinner.active === false,
    {},
    spinner
  );

  const tableRows = await utilities.shadowSelectorAll(page, '.table__row');
  const name1 = await page.evaluate(
    (tableRows) => tableRows[0].children[2].textContent,
    tableRows
  );
  const name2 = await page.evaluate(
    (tableRows) => tableRows[1].children[2].textContent,
    tableRows
  );

  await t.is(name1 < name2, true);
});

test.serial('Should sort data with created date', async (t) => {
  const columnSort = await utilities.shadowSelectorAll(
    page,
    '.table__cell--sort'
  );
  const dateSort = await page.evaluateHandle(
    (columnSort) => columnSort[2],
    columnSort
  );

  await page.evaluate((dateSort) => dateSort.click(), dateSort);

  await page.waitForFunction(
    (spinner) => spinner.active === false,
    {},
    spinner
  );

  const tableRows = await utilities.shadowSelectorAll(page, '.table__row');
  const date1 = await page.evaluate(
    (tableRows) => tableRows[0].children[4].textContent,
    tableRows
  );
  const date2 = await page.evaluate(
    (tableRows) => tableRows[1].children[4].textContent,
    tableRows
  );

  await t.is(isBefore(new Date(date1), new Date(date2)), true);
});

test.serial('Should sort data with updated date', async (t) => {
  const columnSort = await utilities.shadowSelectorAll(
    page,
    '.table__cell--sort'
  );
  const dateSort = await page.evaluateHandle(
    (columnSort) => columnSort[3],
    columnSort
  );

  await page.evaluate((dateSort) => dateSort.click(), dateSort);

  await page.waitForFunction(
    (spinner) => spinner.active === false,
    {},
    spinner
  );

  const tableRows = await utilities.shadowSelectorAll(page, '.table__row');

  const date1 = await page.evaluate(
    (tableRows) => tableRows[0].children[5].textContent,
    tableRows
  );
  const date2 = await page.evaluate(
    (tableRows) => tableRows[1].children[5].textContent,
    tableRows
  );

  await t.is(isBefore(new Date(date1), new Date(date2)), true);
});

test.after(async () => {
  await deleteExample();
  await deleteExample();
});
