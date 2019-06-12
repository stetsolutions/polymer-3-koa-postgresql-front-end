import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';

import '@polymer/iron-ajax/iron-ajax.js';
import '@polymer/iron-form/iron-form.js';
import '@polymer/iron-icons/av-icons.js';

import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-input/paper-input.js';

import './my-password-validator.js';
import './my-password-validator-match.js';
import './shared-style.js';

class MyChangePassword extends PolymerElement {
  static get template() {
    return html`
      <style include="shared-styles">
        :host {
          display: block;
        }

        .form {
          margin-bottom: 16px;
        }

        .form__column {
          @apply --layout-center-center;
          @apply --layout-vertical;
          min-width: 100px;
        }

        .form__input {
          width: 100%;
        }

        .form__column--bottom {
          margin-top: 32px;
        }

        @media only screen and (min-width: 640px) {
          .form__input {
            max-width: 425px;
          }
        }
      </style>

      <my-password-validator
        error-message="{{validationError}}"
        validator-name="passwordValidator"
      ></my-password-validator>

      <my-password-validator-match
        password="[[newPassword]]"
        validator-name="passwordValidatorMatch"
      ></my-password-validator-match>

      <div class="card">
        <iron-form class="form" id="form" with-credentials>
          <form
            action="[[config.api.origin]]/[[config.api.path]]/users/password/[[user.id]]"
            method="post"
            on-keyup="_handleKeyUp"
          >
            <div class="form__column">
              <paper-input
                class="form__input"
                error-message="Invalid Credentials"
                id="currentPassword"
                label="Current Password"
                name="currentPassword"
                required
                type="password"
              ></paper-input>
              <paper-input
                auto-validate
                class="form__input"
                error-message="{{validationError}}"
                id="newPassword"
                label="New Password"
                name="password"
                required
                type="password"
                validator="passwordValidator"
                value="{{newPassword}}"
              ></paper-input>
              <paper-input
                auto-validate
                class="form__input"
                error-message="Passwords need to match"
                id="verifyPassword"
                label="Verify Password"
                name="verifyPassword"
                required
                type="password"
                validator="passwordValidatorMatch"
              ></paper-input>
            </div>

            <div class="form__column form__column--bottom">
              <paper-button
                class="button"
                id="submit"
                on-tap="_handleSubmit"
                raised
              >
                <iron-icon icon="av:loop"></iron-icon>
                <span class="button__text">Change</span></paper-button
              >
            </div>
          </form>
        </iron-form>
      </div>

      <iron-ajax
        content-type="application/json"
        debounce-duration="300"
        id="ajax"
        method="post"
        url="[[config.api.origin]]/[[config.api.path]]/login"
        with-credentials
      ></iron-ajax>
    `;
  }

  static get is() {
    return 'my-change-password';
  }

  static get properties() {
    return {
      config: {
        type: Object,
        value: MyAppGlobals.config,
      },
      fields: {
        type: Array,
        value: () => ['currentPassword', 'newPassword', 'verifyPassword'],
      },
      newPassword: String,
      user: {
        notify: true,
        type: Object,
        value: () => JSON.parse(localStorage.getItem('user')),
      },
    };
  }

  connectedCallback() {
    super.connectedCallback();

    this._attachListeners();
  }

  /**
   * Attach listeners
   */
  _attachListeners() {
    this.addEventListener('iron-form-error', this._handleFormError);
    this.addEventListener('iron-form-response', this._handleFormResponse);
  }

  /**
   * Handle form error
   * @param {object} event
   */
  _handleFormError(event) {
    this._message('var(--paper-red-700)', event.detail.error.message);
  }

  /**
   * Handle form response
   */
  _handleFormResponse() {
    this.$.form.reset();

    this._message('var(--paper-green-700)', 'Password changed successfully!');
  }

  /**
   * Handle key up
   * @param {object} event
   */
  _handleKeyUp(event) {
    if (event.keyCode === 13) {
      this._handleSubmit();
    }
  }

  /**
   * Handle page change
   * @param {object} event
   */
  _handlePageChange(event) {
    if (event.detail.page === 'change-password') {
      this.$.form.reset();
    }
  }

  /**
   * Handle submit
   */
  _handleSubmit() {
    if (!this.$.form.validate()) {
      return;
    }

    const ajax = this.$.ajax;
    const credentials = {
      password: this.$.currentPassword.value,
      username: this.user.username,
    };

    ajax.body = JSON.stringify(credentials);

    const request = ajax.generateRequest();

    request.completes.then(
      () => {
        this.$.form.submit();
      },
      () => {
        request.status !== 401
          ? this._message(
              'var(--paper-red-700)',
              'Communication Error: Please refresh your browser.'
            )
          : (this.$.currentPassword.invalid = true);
      }
    );
  }

  /**
   * Message
   * @param {string} color
   * @param {string} text
   */
  _message(color, text) {
    const toast = document.querySelector('paper-toast');

    toast.style.backgroundColor = color;

    toast.show(text);
    toast.refit();
  }
}

window.customElements.define(MyChangePassword.is, MyChangePassword);
