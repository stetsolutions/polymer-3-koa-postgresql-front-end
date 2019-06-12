const utilities = require('./utilities.js');

module.exports = {
  /**
   * Sign in
   * @async
   * @param {object} page
   * @param {string} usernameValue
   * @param {string} passwordValue
   */
  signIn: async (page, usernameValue, passwordValue) => {
    const buttons = await utilities.shadowSelectorAll(page, 'paper-button');
    const password = await utilities.waitForShadowSelector(page, '#password');
    const username = await utilities.waitForShadowSelector(page, '#username');

    const submitButton = await page.evaluateHandle(
      (buttons) => buttons[1],
      buttons
    );

    await password.type(passwordValue);
    await username.type(usernameValue);

    await page.evaluate((submitButton) => submitButton.click(), submitButton);

    await page.waitForNavigation({waitUntil: 'networkidle2'});
  },

  /**
   * Sign out
   * @async
   * @param {object} page
   */
  signOut: async (page) => {
    const headerMenu = await utilities.shadowSelector(page, '.header__menu');

    await page.evaluateHandle((headerMenu) => {
      headerMenu.children[0].click();
    }, headerMenu);

    await page.evaluateHandle((headerMenu) => {
      headerMenu.children[1].children[2].click();
    }, headerMenu);
  },
};
