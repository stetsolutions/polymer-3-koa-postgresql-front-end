const {test} = require('ava');

const format = require('date-fns/format');

const puppeteer = require('puppeteer');

const project = require('./helpers/project.js');
const utilities = require('./helpers/utilities.js');

const baseUrl = 'http://127.0.0.1:8081';

const admin = {
  password: '!1A2b3C4d!',
  username: 'admin',
};
const dummy = {
  id: 3,
  email: 'dummy@localhost.com',
  firstName: 'Epsilon',
  lastName: 'Zeta',
  password: '!1A2b3C4d!',
  roles: '[2]',
  username: 'dummy',
};

let browser;
let page;

let email;
let firstName;
let lastName;
let password;
let roles;
let username;

let endDate;
let startDate;
let term;

let buttons;
let clearButtonA;
let clearButtonB;
let refreshButton;
let submitButton;
let updateButton;

let spinner;

/**
 * Initial test set up
 */
test.before(async () => {
  const url = `${baseUrl}/user`;

  browser = await puppeteer.launch({headless: true});
  page = await browser.newPage();

  await page.goto(baseUrl, {waitUntil: 'networkidle2'});
  await project.signIn(page, admin['username'], admin['password']);
  await page.goto(url, {waitUntil: 'networkidle0'});

  email = await utilities.waitForShadowSelector(page, '#email');
  firstName = await utilities.waitForShadowSelector(page, '#firstName');
  lastName = await utilities.waitForShadowSelector(page, '#lastName');
  password = await utilities.waitForShadowSelector(page, '#password');
  roles = await utilities.waitForShadowSelector(page, '#roles');
  username = await utilities.waitForShadowSelector(page, '#username');

  endDate = await utilities.waitForShadowSelector(page, '#endDate');
  startDate = await utilities.waitForShadowSelector(page, '#startDate');
  term = await utilities.waitForShadowSelector(page, '#term');

  buttons = await utilities.waitForShadowSelectorAll(page, 'paper-button');
  clearButtonA = await page.evaluateHandle((buttons) => buttons[2], buttons);
  clearButtonB = await page.evaluateHandle((buttons) => buttons[5], buttons);

  refreshButton = await page.evaluateHandle((buttons) => buttons[3], buttons);
  submitButton = await utilities.waitForShadowSelector(page, '#submit');
  updateButton = await page.evaluateHandle((buttons) => buttons[4], buttons);

  spinner = await utilities.waitForShadowSelector(page, '#spinner');
});

test.serial('Should verify title', async (t) => {
  const titleElement = await utilities.waitForShadowSelector(
    page,
    '.header__title'
  );
  const title = await page.evaluate(
    (titleElement) => titleElement.textContent,
    titleElement
  );

  await t.is(title, 'Users');
});

test.serial('Should read users', async (t) => {
  const tableRows = await utilities.waitForShadowSelectorAll(
    page,
    '.table__row'
  );
  const numOfUsers = await page.evaluate(
    (tableRows) => tableRows.length,
    tableRows
  );

  await t.is(numOfUsers, 2);
});

test.serial('Should create user', async (t) => {
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
    (username, dummy) => {
      username.value = dummy['username'];
    },
    username,
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
    (password, dummy) => {
      password.value = dummy['password'];
    },
    password,
    dummy
  );
  await page.evaluate((roles) => roles.click(), roles);

  const rolesItem = await page.evaluateHandle(
    (roles) => roles.children[0].children[0],
    roles
  );

  await page.evaluate((rolesItem) => rolesItem.click(), rolesItem);
  await page.evaluate((submitButton) => submitButton.click(), submitButton);
  await page.waitForSelector('paper-toast', {visible: true});

  const toastText = await page.$eval('paper-toast', (el) => el.text);

  await t.is(toastText, 'User created successfully.');
  await page.waitForSelector('paper-toast', {hidden: true});
});

test.serial('Should change submit button text when in edit mode', async (t) => {
  const editButton = await utilities.waitForShadowSelector(
    page,
    'paper-icon-button[icon="editor:mode-edit"]'
  );

  await page.evaluate((editButton) => editButton.click(), editButton);

  const buttonText = await page.evaluate(
    (submitButton) => submitButton.textContent.trim(),
    submitButton
  );

  await t.is(buttonText, 'Edit');
});

test.serial('Should clear form', async (t) => {
  await page.evaluate((clearButtonA) => clearButtonA.click(), clearButtonA);

  await page.waitForFunction(
    (spinner) => spinner.active === false,
    {},
    spinner
  );

  const firstNameValue = await page.evaluate(
    (firstName) => firstName.value,
    firstName
  );
  const lastNameValue = await page.evaluate(
    (lastName) => lastName.value,
    lastName
  );
  const usernameValue = await page.evaluate(
    (username) => username.value,
    username
  );
  const emailValue = await page.evaluate((email) => email.value, email);
  const passwordValue = await page.evaluate(
    (password) => password.value,
    password
  );
  const rolesValue = await page.evaluate((roles) => roles.value, roles);

  await t.is(firstNameValue, undefined);
  await t.is(lastNameValue, undefined);
  await t.is(usernameValue, undefined);
  await t.is(emailValue, undefined);
  await t.is(passwordValue, undefined);
  await t.is(rolesValue, undefined);
});

test.serial('Should contain the correct id in the delete modal', async (t) => {
  const ids = await utilities.waitForShadowSelectorAll(page, '.id');
  const id = await page.evaluate((ids) => ids[1].textContent, ids);
  const deleteButton = await utilities.waitForShadowSelector(
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

  await t.is(id, modalId);

  const noButton = await page.evaluateHandle(
    `document.querySelector('#dialogConfirm').querySelector('paper-button[data-option="no"]')`
  );

  await page.evaluate((noButton) => noButton.click(), noButton);
});

test.serial(
  'Should disable the submit button when password modal is opened',
  async (t) => {
    const passwordButton = await utilities.waitForShadowSelector(
      page,
      'paper-icon-button[icon="communication:vpn-key"]'
    );

    await page.evaluate(
      (passwordButton) => passwordButton.click(),
      passwordButton
    );

    const passwordSubmitButton = await page.evaluateHandle(
      `document.querySelector('#dialogPassword').querySelector('paper-button[data-option="yes"]')`
    );
    const buttonStatus = await page.evaluate(
      (passwordSubmitButton) => passwordSubmitButton.disabled,
      passwordSubmitButton
    );

    await t.is(buttonStatus, true);

    const noButton = await page.evaluateHandle(
      `document.querySelector('#dialogPassword').querySelector('paper-button[data-option="no"]')`
    );

    await page.evaluate((noButton) => noButton.click(), noButton);
  }
);

test.serial(
  'Should contain the correct name in the password modal',
  async (t) => {
    const tableRows = await utilities.waitForShadowSelectorAll(
      page,
      '.table__row'
    );
    const name = await page.evaluate(
      (tableRows) => tableRows[0].children[4].textContent,
      tableRows
    );
    const passwordButton = await utilities.waitForShadowSelector(
      page,
      'paper-icon-button[icon="communication:vpn-key"]'
    );

    await page.evaluate(
      (passwordButton) => passwordButton.click(),
      passwordButton
    );

    const modalHeader = await page.evaluateHandle(
      `document.querySelector('#dialogPassword').querySelector('h2')`
    );
    const nameModal = await page.evaluate(
      (modalHeader) => modalHeader.textContent.trim(),
      modalHeader
    );

    await t.is(name.trim(), nameModal);

    const noButton = await page.evaluateHandle(
      `document.querySelector('#dialogPassword').querySelector('paper-button[data-option="no"]')`
    );

    await page.evaluate((noButton) => noButton.click(), noButton);
  }
);

test.serial(
  'Should enable the submit button when password is correct',
  async (t) => {
    const passwordButton = await utilities.waitForShadowSelector(
      page,
      'paper-icon-button[icon="communication:vpn-key"]'
    );

    await page.evaluate(
      (passwordButton) => passwordButton.click(),
      passwordButton
    );

    const newPassword = await page.evaluateHandle(
      `document.querySelector('#newPassword')`
    );

    await page.evaluate(
      (newPassword, dummy) => {
        newPassword.value = dummy['password'];
      },
      newPassword,
      dummy
    );

    const passwordSubmitButton = await page.evaluateHandle(
      `document.querySelector('#dialogPassword').querySelector('paper-button[data-option="yes"]')`
    );
    const buttonStatus = await page.evaluate(
      (passwordSubmitButton) => passwordSubmitButton.disabled,
      passwordSubmitButton
    );

    await t.is(buttonStatus, false);

    const noButton = await page.evaluateHandle(
      `document.querySelector('#dialogPassword').querySelector('paper-button[data-option="no"]')`
    );

    await page.evaluate((noButton) => noButton.click(), noButton);
  }
);

test.serial(
  'Should disable the submit button when password is incorrect',
  async (t) => {
    const passwordButton = await utilities.waitForShadowSelector(
      page,
      'paper-icon-button[icon="communication:vpn-key"]'
    );

    await page.evaluate(
      (passwordButton) => passwordButton.click(),
      passwordButton
    );

    const newPassword = await page.evaluateHandle(
      `document.querySelector('#newPassword')`
    );

    await page.evaluate((newPassword) => {
      newPassword.value = '!1A2b3C4d';
    }, newPassword);

    const passwordSubmitButton = await page.evaluateHandle(
      `document.querySelector('#dialogPassword').querySelector('paper-button[data-option="yes"]')`
    );
    const buttonStatus = await page.evaluate(
      (passwordSubmitButton) => passwordSubmitButton.disabled,
      passwordSubmitButton
    );

    await t.is(buttonStatus, true);

    const noButton = await page.evaluateHandle(
      `document.querySelector('#dialogPassword').querySelector('paper-button[data-option="no"]')`
    );

    await page.evaluate((noButton) => noButton.click(), noButton);
  }
);

test.serial('Should update password', async (t) => {
  const passwordButton = await utilities.waitForShadowSelector(
    page,
    'paper-icon-button[icon="communication:vpn-key"]'
  );

  await page.evaluate(
    (passwordButton) => passwordButton.click(),
    passwordButton
  );

  const newPassword = await page.evaluateHandle(
    `document.querySelector('#newPassword')`
  );

  await page.evaluate(
    (newPassword, dummy) => {
      newPassword.value = dummy['password'];
    },
    newPassword,
    dummy
  );

  const passwordSubmitButton = await page.evaluateHandle(
    `document.querySelector('#dialogPassword').querySelector('paper-button[data-option="yes"]')`
  );
  const buttonStatus = await page.evaluate(
    (passwordSubmitButton) => passwordSubmitButton.disabled,
    passwordSubmitButton
  );
  const yesButton = await page.evaluateHandle(
    `document.querySelector('#dialogPassword').querySelector('paper-button[data-option="yes"]')`
  );

  await page.evaluate((yesButton) => yesButton.click(), yesButton);

  await page.waitForFunction(
    (spinner) => spinner.active === false,
    {},
    spinner
  );

  await page.waitForSelector('paper-toast', {visible: true});

  const toastText = await page.$eval('paper-toast', (el) => el.text);

  await t.is(buttonStatus, false);
  await t.is(toastText, 'Password updated successfully.');
  await page.waitForSelector('paper-toast', {hidden: true});
});

test.serial('Should update first name', async (t) => {
  const editButton = await utilities.waitForShadowSelector(
    page,
    'paper-icon-button[icon="editor:mode-edit"]'
  );

  await page.evaluate((editButton) => editButton.click(), editButton);
  await page.evaluate((firstName) => {
    firstName.value = 'Epsilon1';
  }, firstName);

  await page.evaluate((submitButton) => submitButton.click(), submitButton);
  await page.waitForSelector('paper-toast', {visible: true});

  const toastText = await page.$eval('paper-toast', (el) => el.text);

  await t.is(toastText, 'User updated successfully.');
  await page.waitForSelector('paper-toast', {hidden: true});
});

test.serial('Should update last name', async (t) => {
  const editButton = await utilities.waitForShadowSelector(
    page,
    'paper-icon-button[icon="editor:mode-edit"]'
  );

  await page.evaluate((editButton) => editButton.click(), editButton);
  await page.evaluate((lastName) => {
    lastName.value = 'Zeta1';
  }, lastName);

  await page.evaluate((submitButton) => submitButton.click(), submitButton);
  await page.waitForSelector('paper-toast', {visible: true});

  const toastText = await page.$eval('paper-toast', (el) => el.text);

  await t.is(toastText, 'User updated successfully.');
  await page.waitForSelector('paper-toast', {hidden: true});
});

test.serial('Should update username', async (t) => {
  const editButton = await utilities.waitForShadowSelector(
    page,
    'paper-icon-button[icon="editor:mode-edit"]'
  );

  await page.evaluate((editButton) => editButton.click(), editButton);
  await page.evaluate((username) => {
    username.value = 'dummy1';
  }, username);

  await page.evaluate((submitButton) => submitButton.click(), submitButton);
  await page.waitForSelector('paper-toast', {visible: true});

  const toastText = await page.$eval('paper-toast', (el) => el.text);

  await t.is(toastText, 'User updated successfully.');
  await page.waitForSelector('paper-toast', {hidden: true});
});

test.serial('Should update email', async (t) => {
  const editButton = await utilities.waitForShadowSelector(
    page,
    'paper-icon-button[icon="editor:mode-edit"]'
  );

  await page.evaluate((editButton) => editButton.click(), editButton);
  await page.evaluate((email) => {
    email.value = 'dummy1@localhost.com';
  }, email);

  await page.evaluate((submitButton) => submitButton.click(), submitButton);
  await page.waitForSelector('paper-toast', {visible: true});

  const toastText = await page.$eval('paper-toast', (el) => el.text);

  await t.is(toastText, 'User updated successfully.');
  await page.waitForSelector('paper-toast', {hidden: true});
});

test.serial(`Should sort column data`, async (t) => {
  const sortColumns = [];

  const sortButtons = await utilities.waitForShadowSelectorAll(
    page,
    '.table__cell--sort'
  );

  const numOfSortColumn = await page.evaluate(
    (sortButtons) => sortButtons.length,
    sortButtons
  );

  for (let i = 0; i < numOfSortColumn; i++) {
    const sortButton = await page.evaluateHandle(
      (sortButtons, i) => sortButtons[i],
      sortButtons,
      i
    );
    const tabText = await page.evaluate(
      (sortButton) => sortButton.textContent.trim(),
      sortButton
    );

    sortColumns.push(tabText);
  }

  for (let j = 0; j < sortColumns.length; j++) {
    await page.evaluate(
      (refreshButton) => refreshButton.click(),
      refreshButton
    );

    await page.waitForFunction(
      (spinner) => spinner.active === false,
      {},
      spinner
    );

    const tableRows = await utilities.waitForShadowSelectorAll(
      page,
      '.table__row'
    );

    const k = sortColumns[j] === '#' ? 2 : 3;
    const item1 = await page.evaluate(
      (tableRows, j, k) => tableRows[1].children[j + k].textContent,
      tableRows,
      j,
      k
    );

    await page.evaluateHandle(
      (sortButtons, j) => {
        sortButtons[j].click();
      },
      sortButtons,
      j
    );

    await page.waitForFunction(
      (spinner) => spinner.active === false,
      {},
      spinner
    );

    const item2 = await page.evaluate(
      (tableRows, j, k) => tableRows[2].children[j + k].textContent,
      tableRows,
      j,
      k
    );

    if (sortColumns[j] === 'Created' || sortColumns[j] === 'Updated') {
      await t.is(new Date(item2) >= new Date(item1), true);
    } else {
      await t.is(item2 >= item1, true);
    }
  }
});

test.serial('Should not create user with duplicated username', async (t) => {
  await page.evaluate((username) => {
    username.value = 'user';
  }, username);

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
  await page.evaluate((clearButtonA) => clearButtonA.click(), clearButtonA);
});

test.serial('Should not create user with duplicated email', async (t) => {
  await page.evaluate((email) => {
    email.value = 'user@localhost.com';
  }, email);

  await page.evaluate((submitButton) => submitButton.click(), submitButton);

  const emailPath = await page.evaluate(
    (email) => email.getAttribute('data-path'),
    email
  );
  const emailError = `${emailPath}.shadowRoot.querySelector('paper-input-container').querySelector('paper-input-error')`;

  await page.waitForFunction(emailError);

  const error = await page.evaluateHandle(emailError);
  const errorText = await page.evaluate((error) => error.textContent, error);

  await t.is(errorText, 'Must be unique.');

  await page.evaluate((clearButtonA) => clearButtonA.click(), clearButtonA);
});

test.serial('Should select single role', async (t) => {
  const rolesItemA = await page.evaluateHandle(
    (roles) => roles.children[0].children[0],
    roles
  );

  await page.evaluate((rolesItemA) => rolesItemA.click(), rolesItemA);

  const roleText = await page.evaluate(
    (roles) => roles.shadowRoot.querySelector('paper-input').value,
    roles
  );

  await t.is(roleText, 'user');
});

test.serial('Should select multiple roles', async (t) => {
  const rolesItemB = await page.evaluateHandle(
    (roles) => roles.children[0].children[1],
    roles
  );

  await page.evaluate((rolesItemB) => rolesItemB.click(), rolesItemB);

  const roleText = await page.evaluate(
    (roles) => roles.shadowRoot.querySelector('paper-input').value,
    roles
  );

  await t.is(roleText, '2 items selected');
});

test.serial('Should delete user', async (t) => {
  await page.evaluate((clearButtonA) => clearButtonA.click(), clearButtonA);
  await page.waitForFunction(
    (spinner) => spinner.active === false,
    {},
    spinner
  );

  const deleteButtons = await utilities.waitForShadowSelectorAll(
    page,
    'paper-icon-button[icon="delete"]'
  );
  const deleteButton = await page.evaluateHandle(
    (deleteButtons) => deleteButtons[2],
    deleteButtons
  );

  await page.evaluate((deleteButton) => deleteButton.click(), deleteButton);

  const yesButton = await page.evaluateHandle(
    `document.querySelector('#dialogConfirm').querySelector('paper-button[data-option="yes"]')`
  );

  await page.evaluate((yesButton) => yesButton.click(), yesButton);
  await page.waitForSelector('paper-toast', {visible: true});

  const toastText = await page.$eval('paper-toast', (el) => el.text);

  await t.is(toastText, 'User deleted successfully.');
  await page.waitForSelector('paper-toast', {hidden: true});
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

test.serial('Should not create a user when password is missing', async (t) => {
  await page.evaluate((password) => {
    password.value = '';
  }, password);

  await page.evaluate((submitButton) => submitButton.click(), submitButton);

  const passwordInvalid = await page.evaluate(
    (password) => password.invalid,
    password
  );

  await t.is(passwordInvalid, true);
});

test.serial(
  'Should not allow a password with less than 10 characters',
  async (t) => {
    await page.evaluate((password) => {
      password.value = '!1A2b3C4d';
    }, password);

    await page.evaluate((submitButton) => submitButton.click(), submitButton);

    const namePath = await page.evaluate(
      (password) => password.getAttribute('data-path'),
      password
    );

    const passwordError = `${namePath}.shadowRoot.querySelector('paper-input-container').querySelector('paper-input-error')`;

    await page.waitForFunction(passwordError);

    const error = await page.evaluateHandle(passwordError);
    const errorText = await page.evaluate((error) => error.textContent, error);

    await t.is(errorText, 'The password must be at least 10 characters long');

    await page.evaluate((clearButtonA) => clearButtonA.click(), clearButtonA);
  }
);

test.serial(
  'Should not allow a password with more than 128 characters',
  async (t) => {
    await page.evaluate((password) => {
      password.value =
        ')!/uLT="lh&:`6X!]|15o!$!TJf,.13l?vG].-j],lFPe/QhwN#{Z<[*1nX@n1^?WW-%_.*D)m$toB+N7z}kcN#B_d(f41h%w@0F!]igtSQ1gl~6sEV&r~}~1ub>If1c+';
    }, password);

    await page.evaluate((submitButton) => submitButton.click(), submitButton);

    const namePath = await page.evaluate(
      (password) => password.getAttribute('data-path'),
      password
    );
    const passwordError = `${namePath}.shadowRoot.querySelector('paper-input-container').querySelector('paper-input-error')`;

    await page.waitForFunction(passwordError);

    const error = await page.evaluateHandle(passwordError);
    const errorText = await page.evaluate((error) => error.textContent, error);

    await t.is(errorText, 'The password must be fewer than 128 characters');
    await page.evaluate((clearButtonA) => clearButtonA.click(), clearButtonA);
  }
);

test.serial(
  'Should not allow a password with more than 3 or more repeating characters',
  async (t) => {
    await page.evaluate((password) => {
      password.value = '!1Z2y3X4www';
    }, password);

    await page.evaluate((submitButton) => submitButton.click(), submitButton);

    const namePath = await page.evaluate(
      (password) => password.getAttribute('data-path'),
      password
    );
    const passwordError = `${namePath}.shadowRoot.querySelector('paper-input-container').querySelector('paper-input-error')`;

    await page.waitForFunction(passwordError);

    const error = await page.evaluateHandle(passwordError);
    const errorText = await page.evaluate((error) => error.textContent, error);

    await t.is(
      errorText,
      'The password must not contain sequences of three or more repeated characters'
    );

    await page.evaluate((clearButtonA) => clearButtonA.click(), clearButtonA);
  }
);

test.serial(
  'Should not allow a password without at least one lowercase letter',
  async (t) => {
    await page.evaluate((password) => {
      password.value = '!1Z2Y3X4W5';
    }, password);

    await page.evaluate((submitButton) => submitButton.click(), submitButton);

    const namePath = await page.evaluate(
      (password) => password.getAttribute('data-path'),
      password
    );
    const passwordError = `${namePath}.shadowRoot.querySelector('paper-input-container').querySelector('paper-input-error')`;

    await page.waitForFunction(passwordError);

    const error = await page.evaluateHandle(passwordError);
    const errorText = await page.evaluate((error) => error.textContent, error);

    await t.is(
      errorText,
      'The password must contain at least one lowercase letter'
    );

    await page.evaluate((clearButtonA) => clearButtonA.click(), clearButtonA);
  }
);

test.serial(
  'Should not allow a password without at least one uppercase letter',
  async (t) => {
    await page.evaluate((password) => {
      password.value = '!1z2y3x4w5';
    }, password);

    await page.evaluate((submitButton) => submitButton.click(), submitButton);

    const namePath = await page.evaluate(
      (password) => password.getAttribute('data-path'),
      password
    );
    const passwordError = `${namePath}.shadowRoot.querySelector('paper-input-container').querySelector('paper-input-error')`;

    await page.waitForFunction(passwordError);

    const error = await page.evaluateHandle(passwordError);
    const errorText = await page.evaluate((error) => error.textContent, error);

    await t.is(
      errorText,
      'The password must contain at least one uppercase letter'
    );

    await page.evaluate((clearButtonA) => clearButtonA.click(), clearButtonA);
  }
);

test.serial(
  'Should not allow a password without at least one number',
  async (t) => {
    await page.evaluate((password) => {
      password.value = '!Xapboccde';
    }, password);

    await page.evaluate((submitButton) => submitButton.click(), submitButton);

    const namePath = await page.evaluate(
      (password) => password.getAttribute('data-path'),
      password
    );
    const passwordError = `${namePath}.shadowRoot.querySelector('paper-input-container').querySelector('paper-input-error')`;

    await page.waitForFunction(passwordError);

    const error = await page.evaluateHandle(passwordError);
    const errorText = await page.evaluate((error) => error.textContent, error);

    await t.is(errorText, 'The password must contain at least one number');

    await page.evaluate((clearButtonA) => clearButtonA.click(), clearButtonA);
  }
);

test.serial(
  'Should not allow a password without at least one special character',
  async (t) => {
    await page.evaluate((password) => {
      password.value = '11A2b3C4d5';
    }, password);
    await page.evaluate((submitButton) => submitButton.click(), submitButton);

    const namePath = await page.evaluate(
      (password) => password.getAttribute('data-path'),
      password
    );

    const passwordError = `${namePath}.shadowRoot.querySelector('paper-input-container').querySelector('paper-input-error')`;

    await page.waitForFunction(passwordError);

    const error = await page.evaluateHandle(passwordError);
    const errorText = await page.evaluate((error) => error.textContent, error);

    await t.is(
      errorText,
      'The password must contain at least one special character'
    );

    await page.evaluate((clearButtonA) => clearButtonA.click(), clearButtonA);
  }
);

test.serial('Should not create a user when role is missing', async (t) => {
  await page.evaluate((roles) => {
    roles.value = '';
  }, roles);

  await page.evaluate((submitButton) => submitButton.click(), submitButton);

  const rolesInvalid = await page.evaluate((roles) => roles.invalid, roles);

  await t.is(rolesInvalid, true);
});

test.serial('Should change the tab', async (t) => {
  const cards = await utilities.waitForShadowSelector(page, '.card');
  const searchTab = await page.evaluateHandle(
    (cards) => cards.querySelector('paper-tabs').children[1],
    cards
  );

  await page.evaluate((searchTab) => searchTab.click(), searchTab);

  await page.waitForFunction(
    (spinner) => spinner.active === false,
    {},
    spinner
  );

  const tabText = await page.evaluate(
    (searchTab) => searchTab.textContent.trim(),
    searchTab
  );

  await t.is(tabText, 'Search');
});

test.serial('Should search a term', async (t) => {
  await page.evaluate((clearButtonB) => clearButtonB.click(), clearButtonB);

  await page.waitForFunction(
    (spinner) => spinner.active === false,
    {},
    spinner
  );

  await page.evaluate((term) => {
    term.value = 'user@localhost.com';
  }, term);

  await page.evaluate((updateButton) => updateButton.click(), updateButton);

  await page.waitForFunction(
    (spinner) => spinner.active === false,
    {},
    spinner
  );

  const editButtons = await utilities.waitForShadowSelectorAll(
    page,
    'paper-icon-button[icon="editor:mode-edit"]'
  );
  const numOfUsers = await page.evaluate(
    (editButtons) => editButtons.length,
    editButtons
  );

  await t.is(numOfUsers, 1);
});

test.serial('Should not search with invalid start-date', async (t) => {
  await page.evaluate((clearButtonB) => clearButtonB.click(), clearButtonB);

  await page.waitForFunction(
    (spinner) => spinner.active === false,
    {},
    spinner
  );

  await startDate.type(format(new Date(0), 'yyyy'));
  await page.evaluate((updateButton) => updateButton.click(), updateButton);

  const dateInvalid = await page.evaluate(
    (startDate) => startDate.invalid,
    startDate
  );

  await t.is(dateInvalid, true);
});

test.serial('Should not search with invalid end-date', async (t) => {
  await page.evaluate((clearButtonB) => clearButtonB.click(), clearButtonB);

  await page.waitForFunction(
    (spinner) => spinner.active === false,
    {},
    spinner
  );

  await endDate.type(format(new Date(0), 'yyyy'));
  await page.evaluate((updateButton) => updateButton.click(), updateButton);

  const dateInvalid = await page.evaluate(
    (endDate) => endDate.invalid,
    endDate
  );

  await t.is(dateInvalid, true);
});

test.serial('Should clear search form', async (t) => {
  await page.evaluate((clearButtonB) => clearButtonB.click(), clearButtonB);

  await page.waitForFunction(
    (spinner) => spinner.active === false,
    {},
    spinner
  );

  await page.evaluate((term) => {
    term.value = 'user@localhost.com';
  }, term);

  await startDate.type(format(new Date(0), 'yyyy'));
  await endDate.type(format(new Date(0), 'yyyy'));

  await page.evaluate((clearButtonB) => clearButtonB.click(), clearButtonB);

  await page.waitForFunction(
    (spinner) => spinner.active === false,
    {},
    spinner
  );

  const endDateValue = await page.evaluate((endDate) => endDate.value, endDate);
  const startDateValue = await page.evaluate(
    (startDate) => startDate.value,
    startDate
  );
  const termValue = await page.evaluate((term) => term.value, term);

  await t.is(endDateValue, undefined);
  await t.is(startDateValue, undefined);
  await t.is(termValue, undefined);
});

test.serial('Should search using start-date', async (t) => {
  await page.evaluate((clearButtonB) => clearButtonB.click(), clearButtonB);

  await page.waitForFunction(
    (spinner) => spinner.active === false,
    {},
    spinner
  );

  const value = format(new Date(0), "yyyy-MM-dd'T'HH:mm");

  await page.evaluate(
    (startDate, value) => {
      startDate.value = value;
    },
    startDate,
    value
  );

  await page.evaluate((updateButton) => updateButton.click(), updateButton);

  await page.waitForFunction(
    (spinner) => spinner.active === false,
    {},
    spinner
  );

  const editButtons = await utilities.waitForShadowSelectorAll(
    page,
    'paper-icon-button[icon="editor:mode-edit"]'
  );
  const numOfUsers = await page.evaluate(
    (editButtons) => editButtons.length,
    editButtons
  );

  await t.is(numOfUsers, 2);
});

test.serial('Should clear the form when tab is changed', async (t) => {
  await page.evaluate((clearButtonB) => clearButtonB.click(), clearButtonB);

  await page.waitForFunction(
    (spinner) => spinner.active === false,
    {},
    spinner
  );

  await page.evaluate((term) => {
    term.value = 'user@localhost.com';
  }, term);

  await startDate.type(format(new Date(0), 'yyyy'));
  await endDate.type(format(new Date(0), 'yyyy'));

  const cards = await utilities.waitForShadowSelector(page, '.card');
  const userTab = await page.evaluateHandle(
    (cards) => cards.querySelector('paper-tabs').children[0],
    cards
  );

  await page.evaluate((userTab) => userTab.click(), userTab);

  await page.waitForFunction(
    (spinner) => spinner.active === false,
    {},
    spinner
  );

  const searchTab = await page.evaluateHandle(
    (cards) => cards.querySelector('paper-tabs').children[1],
    cards
  );

  await page.evaluate((searchTab) => searchTab.click(), searchTab);

  await page.waitForFunction(
    (spinner) => spinner.active === false,
    {},
    spinner
  );

  const termValue = await page.evaluate((term) => term.value, term);
  const startDateValue = await page.evaluate(
    (startDate) => startDate.value,
    startDate
  );
  const endDateValue = await page.evaluate((endDate) => endDate.value, endDate);

  await t.is(termValue, undefined);
  await t.is(startDateValue, undefined);
  await t.is(endDateValue, undefined);
});
