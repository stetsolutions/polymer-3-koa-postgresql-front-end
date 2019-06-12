const {test} = require('ava');

const puppeteer = require('puppeteer');

const project = require('./helpers/project.js');
const utilities = require('./helpers/utilities.js');

const baseUrl = 'http://127.0.0.1:8081';

const admin = {
  email: 'admin@localhost.com',
  firstName: 'Alpha',
  lastName: 'Beta',
  password: '!1A2b3C4d!',
  username: 'admin',
};
const dummy = {
  email: 'dummy@localhost.com',
  firstName: 'Epsilon',
  lastName: 'Zeta',
  username: 'dummy',
};
const user = {
  email: 'user@localhost.com',
  firstName: 'Gamma',
  lastName: 'Delta',
  username: 'user',
};

let browser;
let page;

let email;
let firstName;
let lastName;
let submitButton;
let username;

/**
 * Initial test set up
 */
test.before(async () => {
  const url = `${baseUrl}/edit-profile`;

  browser = await puppeteer.launch({headless: true});
  page = await browser.newPage();

  await page.goto(baseUrl, {waitUntil: 'networkidle2'});
  await project.signIn(page, admin['username'], admin['password']);
  await page.goto(url, {waitUntil: 'networkidle2'});

  email = await utilities.waitForShadowSelector(page, '#email');
  firstName = await utilities.waitForShadowSelector(page, '#firstName');
  lastName = await utilities.waitForShadowSelector(page, '#lastName');
  submitButton = await utilities.waitForShadowSelector(page, '#submit');
  username = await utilities.waitForShadowSelector(page, '#username');
});

test.serial('Should verify title', async (t) => {
  const title = await utilities.waitForShadowSelector(page, '.header__title');
  const titleValue = await page.evaluate((title) => title.textContent, title);

  await t.is(titleValue, 'Edit Profile');
});

test.serial('Should not edit profile with duplicated username', async (t) => {
  await page.evaluate(
    (username, user) => {
      username.value = user['username'];
    },
    username,
    user
  );
  await page.evaluate((submitButton) => submitButton.click(), submitButton);

  const usernamePath = await page.evaluate(
    (username) => username.getAttribute('data-path'),
    username
  );
  const usernameError = `${usernamePath}.shadowRoot.querySelector('paper-input-container').querySelector('paper-input-error')`;

  await page.waitForFunction(usernameError);

  const error = await page.evaluateHandle(usernameError);
  const errorText = await page.evaluate((error) => error.textContent, error);

  await t.is(errorText, 'Must be unique.');
});

test.serial('Should not edit profile with duplicated email', async (t) => {
  await page.evaluate(
    (email, user) => {
      email.value = user['email'];
    },
    email,
    user
  );
  await page.evaluate((submitButton) => submitButton.click(), submitButton);
  await page.waitFor(100);

  const emailPath = await page.evaluate(
    (email) => email.getAttribute('data-path'),
    email
  );
  const emailError = `${emailPath}.shadowRoot.querySelector('paper-input-container').querySelector('paper-input-error')`;

  await page.waitForFunction(emailError);

  const error = await page.evaluateHandle(emailError);
  const errorText = await page.evaluate((error) => error.textContent, error);

  await t.is(errorText, 'Must be unique.');
});

test.serial(
  'Should not create a user when first-name is missing',
  async (t) => {
    await page.evaluate((firstName) => {
      firstName.value = '';
    }, firstName);
    await page.evaluate((submitButton) => submitButton.click(), submitButton);

    const firstNameInvalid = await page.evaluate(
      (firstName) => firstName.invalid,
      firstName
    );

    await t.is(firstNameInvalid, true);
  }
);

test.serial('Should not create a user when last-name is missing', async (t) => {
  await page.evaluate((lastName) => {
    lastName.value = '';
  }, lastName);
  await page.evaluate((submitButton) => submitButton.click(), submitButton);

  const lastNameInvalid = await page.evaluate(
    (lastName) => lastName.invalid,
    lastName
  );

  await t.is(lastNameInvalid, true);
});

test.serial('Should not create a user when username is missing', async (t) => {
  await page.evaluate((username) => {
    username.value = '';
  }, username);

  await page.evaluate((submitButton) => submitButton.click(), submitButton);

  const usernameInvalid = await page.evaluate(
    (username) => username.invalid,
    username
  );

  await t.is(usernameInvalid, true);
});

test.serial('Should not create a user when email is missing', async (t) => {
  await page.evaluate((email) => {
    email.value = '';
  }, email);
  await page.evaluate((submitButton) => submitButton.click(), submitButton);

  const emailInvalid = await page.evaluate((email) => email.invalid, email);

  await t.is(emailInvalid, true);
});

test.serial(
  'Should not create a user with invalid email address - "abc"',
  async (t) => {
    await page.evaluate((email) => {
      email.value = 'abc';
    }, email);
    await page.evaluate((submitButton) => submitButton.click(), submitButton);

    const emailInvalid = await page.evaluate((email) => email.invalid, email);

    await t.is(emailInvalid, true);
  }
);

test.serial(
  'Should not create a user with invalid email address - "abc@"',
  async (t) => {
    await page.evaluate((email) => {
      email.value = 'abc@';
    }, email);
    await page.evaluate((submitButton) => submitButton.click(), submitButton);

    const emailInvalid = await page.evaluate((email) => email.invalid, email);

    await t.is(emailInvalid, true);
  }
);

/**
 * Note: abc@abc is a valid email address according to HTML5.
 * However, abc@abc@abc is an invalid email address.
 */
test.serial(
  'Should not create a user with invalid email address - "abc@abc@abc"',
  async (t) => {
    await page.evaluate((email) => {
      email.value = 'abc@abc@abc';
    }, email);
    await page.evaluate((submitButton) => submitButton.click(), submitButton);

    const emailInvalid = await page.evaluate((email) => email.invalid, email);

    await t.is(emailInvalid, true);
  }
);

test.serial(
  'Should not create a user with invalid email address - "abc@test."',
  async (t) => {
    await page.evaluate((email) => {
      email.value = 'abc@test.';
    }, email);
    await page.evaluate((submitButton) => submitButton.click(), submitButton);

    const emailInvalid = await page.evaluate((email) => email.invalid, email);

    await t.is(emailInvalid, true);
  }
);

test.serial('Should update profile', async (t) => {
  await page.evaluate(
    (firstName, dummy) => {
      firstName.value = dummy['firstName'];
    },
    firstName,
    dummy
  );
  await page.evaluate(
    (lastName, dummy) => {
      lastName.value = dummy['lastName'];
    },
    lastName,
    dummy
  );
  await page.evaluate(
    (email, dummy) => {
      email.value = dummy['email'];
    },
    email,
    dummy
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

  await t.is(toastText, 'Profile updated successfully!');
  await page.waitForSelector('paper-toast', {hidden: true});
  await page.evaluate(
    (firstName, admin) => {
      firstName.value = admin['firstName'];
    },
    firstName,
    admin
  );
  await page.evaluate(
    (lastName, admin) => {
      lastName.value = admin['lastName'];
    },
    lastName,
    admin
  );
  await page.evaluate(
    (email, admin) => {
      email.value = admin['email'];
    },
    email,
    admin
  );
  await page.evaluate(
    (username, admin) => {
      username.value = admin['username'];
    },
    username,
    admin
  );
  await page.evaluate((submitButton) => submitButton.click(), submitButton);
  await page.waitForSelector('paper-toast', {visible: true});
});
