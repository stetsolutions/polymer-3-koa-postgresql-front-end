import {IronMeta} from '@polymer/iron-meta/iron-meta.js';
import {IronValidatorBehavior} from '@polymer/iron-validator-behavior/iron-validator-behavior.js';

import {mixinBehaviors} from '@polymer/polymer/lib/legacy/class.js';
import {PolymerElement} from '@polymer/polymer/polymer-element.js';

class MyPasswordValidator extends mixinBehaviors(
  [IronValidatorBehavior],
  PolymerElement
) {
  static get is() {
    return 'my-password-validator';
  }

  static get properties() {
    return {
      errorMessage: {
        notify: true,
        type: String,
      },
      isValid: {
        notify: true,
        type: Boolean,
      },
      mode: String,
      validatorName: {
        type: String,
        value: () => this.is,
      },
    };
  }

  connectedCallback() {
    super.connectedCallback();

    new IronMeta({type: 'validator', key: this.validatorName, value: this});
  }

  /**
   * Validate
   * @extends IronValidatorBehavior
   * @param {string} value
   * @return {boolean}
   */
  validate(value) {
    if (this.mode === 'edit') {
      return true;
    }

    this.isValid = true;

    if (value !== undefined) {
      if (value.length < 10) {
        this.errorMessage = 'The password must be at least 10 characters long';

        this.isValid = false;
      } else if (value.length >= 128) {
        this.errorMessage = 'The password must be fewer than 128 characters';

        this.isValid = false;
      } else if (!/[a-z]/.test(value)) {
        this.errorMessage =
          'The password must contain at least one lowercase letter';

        this.isValid = false;
      } else if (!/[A-Z]/.test(value)) {
        this.errorMessage =
          'The password must contain at least one uppercase letter';

        this.isValid = false;
      } else if (!/\d/.test(value)) {
        this.errorMessage = 'The password must contain at least one number';

        this.isValid = false;
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
        this.errorMessage =
          'The password must contain at least one special character';

        this.isValid = false;
      } else if (/(.)\1{2,}/.test(value)) {
        this.errorMessage =
          'The password must not contain sequences of three or more repeated characters';

        this.isValid = false;
      }

      return this.isValid;
    }
  }
}

window.customElements.define(MyPasswordValidator.is, MyPasswordValidator);
