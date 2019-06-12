import {MutableData} from '@polymer/polymer/lib/mixins/mutable-data.js';
import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';

import '@polymer/iron-ajax/iron-ajax.js';
import '@polymer/iron-form/iron-form.js';
import '@polymer/iron-icons/image-icons.js';
import '@polymer/iron-icons/iron-icons.js';

import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-input/paper-input.js';

import './shared-style.js';

class MyEditProfile extends MutableData(PolymerElement) {
  static get template() {
    return html`
      <style include="shared-styles">
        :host {
          display: block;
        }

        .form__input {
          width: 100%;
        }

        .form__column {
          @apply --layout-center-center;
          @apply --layout-vertical;
          min-width: 100px;
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
        <iron-form class="form" id="form">
          <form on-keyup="_handleKeyUp">
            <div class="form__column">
              <paper-input
                class="form__input"
                id="firstName"
                label="First Name"
                name="firstName"
                required
                value="[[user.first_name]]"
              ></paper-input>
              <paper-input
                class="form__input"
                id="lastName"
                label="Last Name"
                name="lastName"
                required
                value="[[user.last_name]]"
              ></paper-input>
              <paper-input
                auto-validate
                class="form__input"
                id="email"
                error-message="Invalid email."
                label="Email"
                pattern="[a-zA-Z0-9.!#$%&’*+/=?^_\`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*"
                name="email"
                required
                type="email"
                value="[[user.email]]"
              ></paper-input>
              <paper-input
                class="form__input"
                id="username"
                label="Username"
                name="username"
                required
                value="[[user.username]]"
              ></paper-input>
            </div>

            <div class="form__column form__column--bottom">
              <paper-button
                class="button"
                id="submit"
                on-tap="_handleSubmit"
                raised
              >
                <iron-icon icon="image:edit"></iron-icon>
                <span class="button__text">Edit</span>
              </paper-button>
            </div>
          </form>
        </iron-form>
      </div>

      <iron-ajax
        content-type="application/json"
        debounce-duration="300"
        id="ajax"
        with-credentials
      ></iron-ajax>
    `;
  }

  static get is() {
    return 'my-edit-profile';
  }

  static get properties() {
    return {
      config: {
        type: Object,
        value: MyAppGlobals.config,
      },
      user: {
        type: Object,
        value: () => JSON.parse(localStorage.getItem('user')),
      },
    };
  }

  /**
   * Check exists
   * @param {string} column
   * @param {string} value
   * @return {promise}
   */
  _checkExists(column, value) {
    const ajax = this.$.ajax;

    return new Promise((resolve) => {
      if (!value) {
        resolve();

        return;
      }

      value = column === 'email' ? value.trim().toLowerCase() : value.trim();

      ajax.body = {};
      ajax.method = 'get';
      ajax.params = {};
      ajax.url = `${this.config.api.origin}/${
        this.config.api.path
      }/users/${column}/${value.trim()}`;

      const request = ajax.generateRequest();

      request.completes.then(
        (req) => {
          resolve(req.response);
        },
        () => {
          this._message(
            'var(--paper-red-700)',
            'Communication Error: Please refresh your browser.'
          );
        }
      );
    });
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
    if (event.detail.page === 'edit-profile') {
      this.notifyPath('user');
    }
  }

  /**
   * Handle submit
   */
  _handleSubmit() {
    this._verifyUniqueness();
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

  /**
   * Update
   */
  _update() {
    const ajax = this.$.ajax;
    const form = this.$.form.serializeForm();

    const user = {
      email: form.email,
      firstName: form.firstName,
      lastName: form.lastName,
      username: form.username,
    };

    ajax.body = user;
    ajax.method = 'post';
    ajax.params = {};

    ajax.url = `${this.config.api.origin}/${
      this.config.api.path
    }/users/profile/${this.user.id}`;

    const request = ajax.generateRequest();

    request.completes.then(
      (req) => {
        const response = req.response;

        if (this.user.id !== response.id) {
          return;
        }

        this.user = response;

        this.dispatchEvent(
          new CustomEvent('update-user', {
            bubbles: true,
            detail: {
              user: this.user,
            },
          })
        );

        this._message(
          'var(--paper-green-700)',
          'Profile updated successfully!'
        );
      },
      () => {
        this._message(
          'var(--paper-red-700)',
          'Communication Error: Please refresh your browser.'
        );
      }
    );
  }

  /**
   * Verify uniqueness
   */
  _verifyUniqueness() {
    const email = this.$.email;
    const username = this.$.username;

    const checkEmail = this._checkExists('email', email.value);
    const checkUsername = this._checkExists('username', username.value);

    let verified = this.$.form.validate();

    checkEmail.then((value) => {
      if (value && value.id !== this.user.id) {
        verified = false;

        email.errorMessage = 'Must be unique.';
        email.invalid = true;
      }
    });

    checkUsername.then((value) => {
      if (value && value.id !== this.user.id) {
        verified = false;

        username.errorMessage = 'Must be unique.';
        username.invalid = true;
      }
    });

    Promise.all([checkEmail, checkUsername]).then(() => {
      if (verified) {
        this._update();
      }
    });
  }
}

window.customElements.define(MyEditProfile.is, MyEditProfile);
