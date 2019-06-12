import {IronMeta} from '@polymer/iron-meta/iron-meta.js';
import {IronValidatorBehavior} from '@polymer/iron-validator-behavior/iron-validator-behavior.js';

import {mixinBehaviors} from '@polymer/polymer/lib/legacy/class.js';
import {PolymerElement} from '@polymer/polymer/polymer-element.js';

class MyPasswordValidatorMatch extends mixinBehaviors(
  [IronValidatorBehavior],
  PolymerElement
) {
  static get is() {
    return 'my-password-validator-match';
  }

  connectedCallback() {
    super.connectedCallback();

    new IronMeta({type: 'validator', key: this.validatorName, value: this});
  }

  static get properties() {
    return {
      password: String,
      validatorName: {
        type: String,
        value: () => this.is,
      },
    };
  }

  /**
   * Validate
   * @extends IronValidatorBehavior
   * @param {number|string} value
   * @return {boolean}
   */
  validate(value) {
    return !value || value === this.password;
  }
}

window.customElements.define(
  MyPasswordValidatorMatch.is,
  MyPasswordValidatorMatch
);
