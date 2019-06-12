import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';

import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/iron-form/iron-form.js';

import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-input/paper-input.js';

import './shared-style.js';

class MyLogin extends PolymerElement {
  static get template() {
    return html`
      <style include="shared-styles">
        :host {
          display: block;
        }

        .form {
          margin: 20px 0 20px 0;
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

      <div class="card">
        <iron-form class="form" id="form" with-credentials>
          <form
            action="[[config.api.origin]]/[[config.api.path]]/login"
            method="post"
            on-keyup="_handleKeyUp"
          >
            <div class="form__column">
              <paper-input
                id="username"
                class="form__input"
                id="username"
                label="Username"
                name="username"
                required
              ></paper-input>
              <paper-input
                id="password"
                class="form__input"
                label="Password"
                name="password"
                required
                type="password"
              ></paper-input>
            </div>

            <div class="form__column form__column--bottom">
              <paper-button on-tap="_handleSubmit" raised>
                <iron-icon icon="icons:add"></iron-icon>
                <span class="button__text">Sign In</span>
              </paper-button>
            </div>
          </form>
        </iron-form>
      </div>
    `;
  }

  static get is() {
    return 'my-login';
  }

  static get properties() {
    return {
      config: {
        type: Object,
        value: MyAppGlobals.config,
      },
      user: Object,
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
    const message =
      event.detail.request.status === 429
        ? 'Too many requests, please try again later!'
        : 'Invalid credentials, please try again!';

    this._message('var(--paper-red-700)', message);
  }

  /**
   * Handle form response
   * @param {object} event
   */
  _handleFormResponse(event) {
    this.user = event.detail.response;

    this.user.timestamp = Date.now();

    localStorage.setItem('user', JSON.stringify(this.user));

    window.location.href = '/dashboard';
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
   * Handle submit
   */
  _handleSubmit() {
    this.$.username.value = this.$.username.value.trim();

    this.$.form.submit();
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

window.customElements.define(MyLogin.is, MyLogin);
