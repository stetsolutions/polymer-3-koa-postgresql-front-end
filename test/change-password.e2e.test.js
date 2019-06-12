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

let currentPassword;
let password;
let submitButton;
let verifyPassword;

/**
 * Initial test set up
 */
test.before(async () => {
  const url = `${baseUrl}/change-password`;

  browser = await puppeteer.launch({headless: true});
  page = await browser.newPage();

  await page.goto(baseUrl, {waitUntil: 'networkidle2'});
  await project.signIn(page, admin['username'], admin['password']);
  await page.goto(url, {waitUntil: 'networkidle2'});

  currentPassword = await utilities.waitForShadowSelector(
    page,
    '#currentPassword'
  );
  password = await utilities.waitForShadowSelector(page, '#newPassword');
  submitButton = await utilities.waitForShadowSelector(page, '#submit');
  verifyPassword = await utilities.waitForShadowSelector(
    page,
    '#verifyPassword'
  );
});

test.serial('Should verify title', async (t) => {
  const title = await utilities.waitForShadowSelector(page, '.header__title');
  const titleValue = await page.evaluate((title) => title.textContent, title);

  await t.is(titleValue, 'Change Password');
});

test.serial(
  'Should not change password without current password',
  async (t) => {
    await page.evaluate(
      (password, admin) => {
        password.value = admin['password'];
      },
      password,
      admin
    );
    await page.evaluate(
      (verifyPassword, admin) => {
        verifyPassword.value = admin['password'];
      },
      verifyPassword,
      admin
    );
    await page.evaluate((submitButton) => submitButton.click(), submitButton);

    const currentPasswordInvalid = await page.evaluate(
      (currentPassword) => currentPassword.invalid,
      currentPassword
    );

    await t.is(currentPasswordInvalid, true);
  }
);

test.serial('Should not change password without new password', async (t) => {
  await page.evaluate(
    (currentPassword, admin) => {
      currentPassword.value = admin['password'];
    },
    currentPassword,
    admin
  );
  await page.evaluate((password) => {
    password.value = '';
  }, password);
  await page.evaluate(
    (verifyPassword, admin) => {
      verifyPassword.value = admin['password'];
    },
    verifyPassword,
    admin
  );
  await page.evaluate((submitButton) => submitButton.click(), submitButton);

  const newPasswordInvalid = await page.evaluate(
    (password) => password.invalid,
    password
  );

  await t.is(newPasswordInvalid, true);
});

test.serial('Should not change password without verify password', async (t) => {
  await page.evaluate(
    (currentPassword, admin) => {
      currentPassword.value = admin['password'];
    },
    currentPassword,
    admin
  );
  await page.evaluate(
    (password, admin) => {
      password.value = admin['password'];
    },
    password,
    admin
  );
  await page.evaluate((verifyPassword) => {
    verifyPassword.value = '';
  }, verifyPassword);
  await page.evaluate((submitButton) => submitButton.click(), submitButton);

  const verifyPasswordInvalid = await page.evaluate(
    (verifyPassword) => verifyPassword.invalid,
    verifyPassword
  );

  await t.is(verifyPasswordInvalid, true);
});

test.serial(
  'Should not allow a password with less than 10 characters',
  async (t) => {
    await page.evaluate((password) => {
      password.value = '!1A2b3C4d';
    }, password);

    const dataPath = await page.evaluate(
      (password) => password.getAttribute('data-path'),
      password
    );
    const passwordError = `${dataPath}.shadowRoot.querySelector('paper-input-container').querySelector('paper-input-error')`;

    await page.waitForFunction(passwordError);

    const error = await page.evaluateHandle(passwordError);
    const errorText = await page.evaluate((error) => error.textContent, error);

    await t.is(errorText, 'The password must be at least 10 characters long');
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

    const dataPath = await page.evaluate(
      (password) => password.getAttribute('data-path'),
      password
    );
    const passwordError = `${dataPath}.shadowRoot.querySelector('paper-input-container').querySelector('paper-input-error')`;

    await page.waitForFunction(passwordError);

    const error = await page.evaluateHandle(passwordError);
    const errorText = await page.evaluate((error) => error.textContent, error);

    await t.is(errorText, 'The password must be fewer than 128 characters');
  }
);

test.serial(
  'Should not allow a password with more than 3 or more repeating characters',
  async (t) => {
    await page.evaluate((password) => {
      password.value = '!1Z2y3X4www';
    }, password);

    await page.evaluate((submitButton) => submitButton.click(), submitButton);

    const dataPath = await page.evaluate(
      (password) => password.getAttribute('data-path'),
      password
    );
    const passwordError = `${dataPath}.shadowRoot.querySelector('paper-input-container').querySelector('paper-input-error')`;

    await page.waitForFunction(passwordError);

    const error = await page.evaluateHandle(passwordError);
    const errorText = await page.evaluate((error) => error.textContent, error);

    await t.is(
      errorText,
      'The password must not contain sequences of three or more repeated characters'
    );
  }
);

test.serial(
  'Should not allow a password without at least one lowercase letter',
  async (t) => {
    await page.evaluate((password) => {
      password.value = '!1Z2Y3X4W5';
    }, password);
    await page.evaluate((submitButton) => submitButton.click(), submitButton);

    const dataPath = await page.evaluate(
      (password) => password.getAttribute('data-path'),
      password
    );
    const passwordError = `${dataPath}.shadowRoot.querySelector('paper-input-container').querySelector('paper-input-error')`;

    await page.waitForFunction(passwordError);

    const error = await page.evaluateHandle(passwordError);
    const errorText = await page.evaluate((error) => error.textContent, error);

    await t.is(
      errorText,
      'The password must contain at least one lowercase letter'
    );
  }
);

test.serial(
  'Should not allow a password without at least one uppercase letter',
  async (t) => {
    await page.evaluate((password) => {
      password.value = '!1z2y3x4w5';
    }, password);
    await page.evaluate((submitButton) => submitButton.click(), submitButton);

    const dataPath = await page.evaluate(
      (password) => password.getAttribute('data-path'),
      password
    );
    const passwordError = `${dataPath}.shadowRoot.querySelector('paper-input-container').querySelector('paper-input-error')`;

    await page.waitForFunction(passwordError);

    const error = await page.evaluateHandle(passwordError);
    const errorText = await page.evaluate((error) => error.textContent, error);

    await t.is(
      errorText,
      'The password must contain at least one uppercase letter'
    );
  }
);

test.serial(
  'Should not allow a password without at least one number',
  async (t) => {
    await page.evaluate((password) => {
      password.value = '!Xapboccde';
    }, password);
    await page.evaluate((submitButton) => submitButton.click(), submitButton);

    const dataPath = await page.evaluate(
      (password) => password.getAttribute('data-path'),
      password
    );
    const passwordError = `${dataPath}.shadowRoot.querySelector('paper-input-container').querySelector('paper-input-error')`;

    await page.waitForFunction(passwordError);

    const error = await page.evaluateHandle(passwordError);
    const errorText = await page.evaluate((error) => error.textContent, error);

    await t.is(errorText, 'The password must contain at least one number');
  }
);

test.serial(
  'Should not allow a password without at least one special character',
  async (t) => {
    await page.evaluate((password) => {
      password.value = '11A2b3C4d5';
    }, password);
    await page.evaluate((submitButton) => submitButton.click(), submitButton);

    const dataPath = await page.evaluate(
      (password) => password.getAttribute('data-path'),
      password
    );
    const passwordError = `${dataPath}.shadowRoot.querySelector('paper-input-container').querySelector('paper-input-error')`;

    await page.waitForFunction(passwordError);

    const error = await page.evaluateHandle(passwordError);
    const errorText = await page.evaluate((error) => error.textContent, error);

    await t.is(
      errorText,
      'The password must contain at least one special character'
    );
  }
);

test.serial('Should not allow if verify password does not match', async (t) => {
  await page.evaluate(
    (currentPassword, admin) => {
      currentPassword.value = admin['password'];
    },
    currentPassword,
    admin
  );
  await page.evaluate(
    (password, admin) => {
      password.value = admin['password'];
    },
    password,
    admin
  );
  await page.evaluate((verifyPassword) => {
    verifyPassword.value = '!1A2b3C4d';
  }, verifyPassword);
  await page.evaluate((submitButton) => submitButton.click(), submitButton);

  const dataPath = await page.evaluate(
    (verifyPassword) => verifyPassword.getAttribute('data-path'),
    verifyPassword
  );
  const passwordError = `${dataPath}.shadowRoot.querySelector('paper-input-container').querySelector('paper-input-error')`;

  await page.waitForFunction(passwordError);

  const error = await page.evaluateHandle(passwordError);
  const errorText = await page.evaluate((error) => error.textContent, error);

  await t.is(errorText, 'Passwords need to match');
});

test.serial('Should change password', async (t) => {
  await page.evaluate(
    (currentPassword, admin) => {
      currentPassword.value = admin['password'];
    },
    currentPassword,
    admin
  );
  await page.evaluate(
    (password, admin) => {
      password.value = admin['password'];
    },
    password,
    admin
  );
  await page.evaluate(
    (verifyPassword, admin) => {
      verifyPassword.value = admin['password'];
    },
    verifyPassword,
    admin
  );
  await page.evaluate((submitButton) => submitButton.click(), submitButton);

  await page.waitForSelector('paper-toast', {visible: true});

  const currentPasswordValue = await page.evaluate(
    (currentPassword) => currentPassword.value,
    currentPassword
  );
  const newPasswordValue = await page.evaluate(
    (password) => password.value,
    password
  );
  const toastText = await page.$eval('paper-toast', (el) => el.text);
  const verifyPasswordValue = await page.evaluate(
    (verifyPassword) => verifyPassword.value,
    verifyPassword
  );

  await t.is(currentPasswordValue, undefined);
  await t.is(newPasswordValue, undefined);
  await t.is(toastText, 'Password changed successfully!');
  await t.is(verifyPasswordValue, undefined);
});
