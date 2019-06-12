module.exports = {
  /**
   * Wait for shadow selector
   * @async
   * @param {object} page
   * @param {string} selector
   * @return {object}
   */
  waitForShadowSelector: async (page, selector) => {
    let element;
    let rendered = false;

    while (rendered === false) {
      try {
        element = await module.exports.shadowSelector(page, selector);
        rendered = true;
      } catch (error) {}
    }

    return element;
  },

  /**
   * Wait for shadow selector all
   * @async
   * @param {object} page
   * @param {string} selector
   * @return {object}
   */
  waitForShadowSelectorAll: async (page, selector) => {
    let elements;
    let rendered = false;

    while (rendered === false) {
      try {
        elements = await module.exports.shadowSelectorAll(page, selector);
        rendered = true;
      } catch (error) {}
    }

    return elements;
  },

  /**
   * Shadow selector
   * @async
   * @param {object} page
   * @param {string} selector
   * @return {object}
   */
  shadowSelector: async (page, selector) => {
    const elements = await module.exports.shadowSelectorAll(page, selector);

    const element = await page.evaluateHandle((elements) => {
      const path = elements[0]
        .getAttribute('data-path')
        .replace('querySelectorAll', 'querySelector');

      elements[0].setAttribute('data-path', path);

      return elements[0];
    }, elements);

    return element;
  },

  /**
   * Shadow selector all
   * @async
   * @param {object} page
   * @param {string} selector
   * @return {array}
   */
  shadowSelectorAll: async (page, selector) => {
    const selectors = selector.split(',').map((s) => s.trim());

    return page.evaluateHandle((selectors) => {
      let match = [];

      for (let i = 0; i < selectors.length; i++) {
        const selector = selectors[i];

        const findNodes = (nodes, parentTags) => {
          if (!nodes) {
            nodes = document.querySelectorAll('*');
          }

          for (let j = 0; j < nodes.length; j++) {
            let tags = [];

            if (parentTags) {
              tags = parentTags.map((tag) => tag);
            }

            tags.push(nodes[j].tagName);

            if (nodes[j].shadowRoot) {
              const el = nodes[j].shadowRoot.querySelector(selector);

              if (el) {
                let path = '';
                const elements = Object.values(
                  nodes[j].shadowRoot.querySelectorAll(selector)
                );

                for (let k = 0; k < tags.length; k++) {
                  const root = k === 0 ? 'document' : '.shadowRoot';
                  path = `${path}${root}.querySelector('${tags[k]}')`;
                }

                path = `${path}.shadowRoot.querySelectorAll('${selector}')`;

                for (let k = 0; k < elements.length; k++) {
                  elements[k].setAttribute('data-path', path);
                }

                match = match.concat(elements);
              }

              const childNodes = nodes[j].shadowRoot.querySelectorAll('*');

              findNodes(childNodes, tags);
            }
          }
        };

        findNodes();
      }

      match = match.filter(
        (item, index, inputArray) => inputArray.indexOf(item) === index
      );

      return match;
    }, selectors);
  },
};
