import {format} from 'date-fns';

import {timeOut} from '@polymer/polymer/lib/utils/async.js';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce.js';
import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';

import '@polymer/iron-ajax/iron-ajax.js';
import '@polymer/iron-form/iron-form.js';
import '@polymer/iron-icons/av-icons.js';
import '@polymer/iron-icons/editor-icons.js';
import '@polymer/iron-icons/social-icons.js';
import '@polymer/iron-image/iron-image.js';

import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-spinner/paper-spinner.js';
import '@polymer/paper-tabs/paper-tabs.js';

import './my-pagination.js';
import './my-password-validator.js';
import './shared-style.js';

class MyUser extends PolymerElement {
  static get template() {
    return html`
      <style include="shared-styles">
        :host {
          display: block;
        }

        .grid {
          display: grid;
          grid-gap: 0 16px;
        }

        .checkbox {
          background: url('images/svgs/unchecked.svg') no-repeat;
          background-position: 7px 12px;
          padding-left: 40px;
        }

        .checkbox.iron-selected {
          background: url('images/svgs/checked.svg') no-repeat;
          background-position: 7px 12px;
        }

        .button {
          margin: 10px 10px 0 0;
        }

        .pane--search {
          display: none;
        }

        .pane__date {
          --paper-input-container: {
            padding: 6px 0 8px 0;
          }
        }

        .pane__bottom {
          @apply --layout-horizontal;
          margin-top: 16px;
        }

        @media only screen and (min-width: 1080px) {
          .pane__top {
            grid-template-columns: repeat(2, minmax(200px, 1fr));
          }

          .pane__top--search {
            grid-template-columns: repeat(3, minmax(100px, 1fr));
          }
        }

        @media only screen and (min-width: 1280px) {
          .pane__top {
            grid-template-columns: repeat(4, minmax(200px, 1fr));
          }
        }
      </style>

      <div class="card">
        <paper-tabs
          autoselect
          class="tabs"
          no-bar
          no-slide
          on-selected-changed="_handleTabs"
          selected="{{tab}}"
        >
          <paper-tab class="tabs__tab">
            <iron-icon icon="icons:create"></iron-icon><span>Create</span>
          </paper-tab>

          <paper-tab class="tabs__tab">
            <iron-icon icon="icons:search"></iron-icon><span>Search</span>
          </paper-tab>
        </paper-tabs>

        <div class="pane" id="paneA">
          <iron-form id="create">
            <form on-keyup="_handleKeyUp">
              <div class="pane__top grid">
                <paper-input
                  id="firstName"
                  label="First Name"
                  name="firstName"
                  required
                ></paper-input>
                <paper-input
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  required
                ></paper-input>
                <paper-input
                  id="username"
                  label="Username"
                  name="username"
                  required
                ></paper-input>
                <paper-input
                  auto-validate
                  error-message="Invalid email"
                  id="email"
                  label="Email"
                  name="email"
                  pattern="[a-zA-Z0-9.!#$%&’*+/=?^_\`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*"
                  required
                  type="email"
                ></paper-input>
                <paper-input
                  auto-validate
                  error-message="[[validationError]]"
                  id="password"
                  label="Password"
                  name="password"
                  required
                  type="password"
                  validator="passwordValidator"
                ></paper-input>

                <paper-dropdown-menu
                  class="roles"
                  id="roles"
                  ignore-select="true"
                  label="Roles"
                  name="roles"
                  on-iron-deselect="_handleLabelChange"
                  on-iron-select="_handleLabelChange"
                  required
                >
                  <paper-listbox
                    attr-for-selected="value"
                    class="listbox"
                    id="listbox"
                    multi
                    selected-values="{{selectedRoleValues}}"
                    slot="dropdown-content"
                  >
                    <template
                      as="item"
                      is="dom-repeat"
                      items="{{roles.results}}"
                    >
                      <paper-item
                        class="listbox__item checkbox"
                        value$="[[item.id]]"
                      >
                        [[item.role_name]]
                      </paper-item>
                    </template>
                  </paper-listbox>
                </paper-dropdown-menu>

                <input
                  name="roleValue"
                  type="hidden"
                  value="{{selectedRoleValues}}"
                />
              </div>

              <div class="pane__bottom">
                <paper-button
                  class="button"
                  id="submit"
                  on-tap="_handleSubmit"
                  raised
                >
                  <iron-icon icon="icons:create"></iron-icon>
                  <span class="button__text">Create</span>
                </paper-button>

                <paper-button class="button" on-tap="_handleClear" raised>
                  <iron-icon icon="icons:clear"></iron-icon>
                  <span class="button__text">Clear</span>
                </paper-button>

                <paper-button class="button" on-tap="_handleRefresh" raised>
                  <iron-icon icon="icons:refresh"></iron-icon>
                  <span class="button__text">Refresh</span>
                </paper-button>
              </div>
            </form>
          </iron-form>
        </div>

        <div class="pane pane--search" id="paneB">
          <iron-form id="search">
            <form on-keyup="_handleKeyUp">
              <div class="grid pane__top pane__top--search">
                <paper-input id="term" label="Search" name="term"></paper-input>
                <paper-input
                  class="pane__date"
                  id="startDate"
                  label="Start Date"
                  name="startDate"
                  placeholder="yyyy-mm-dd,--:--"
                  type="datetime-local"
                ></paper-input>
                <paper-input
                  class="pane__date"
                  id="endDate"
                  label="End Date"
                  name="endDate"
                  placeholder="yyyy-mm-dd,--:--"
                  type="datetime-local"
                ></paper-input>
              </div>

              <div class="pane__bottom">
                <paper-button class="button" on-tap="_handleSubmit" raised>
                  <iron-icon icon="icons:search"></iron-icon>
                  <span class="button__text">Search</span>
                </paper-button>

                <paper-button class="button" on-tap="_handleClear" raised>
                  <iron-icon icon="icons:clear"></iron-icon>
                  <span class="button__text">Clear</span>
                </paper-button>

                <paper-button class="button" on-tap="_handleRefresh" raised>
                  <iron-icon icon="icons:refresh"></iron-icon>
                  <span class="button__text">Refresh</span>
                </paper-button>
              </div>
            </form>
          </iron-form>
        </div>
      </div>

      <div class="card">
        <div class="table">
          <div class="table__header">
            <div class="table__cell table__cell--icon"></div>
            <div class="table__cell password-button"></div>
            <div
              class="table__cell id table__cell--sort"
              data-column="id"
              on-tap="_handleSort"
            >
              #
            </div>
            <div class="table__cell" data-column="roles">Roles</div>
            <div
              class="table__cell table__cell--sort"
              data-column="last_name"
              on-tap="_handleSort"
            >
              Name
            </div>
            <div
              class="table__cell table__cell--sort"
              data-column="username"
              on-tap="_handleSort"
            >
              Username
            </div>
            <div
              class="table__cell table__cell--sort"
              data-column="email"
              on-tap="_handleSort"
            >
              Email
            </div>
            <div
              class="table__cell table__cell--sort"
              data-column="created"
              on-tap="_handleSort"
            >
              Created
            </div>
            <div
              class="table__cell table__cell--sort"
              data-column="updated"
              on-tap="_handleSort"
            >
              Updated
            </div>
            <div class="table__cell table__cell--icon"></div>
          </div>

          <template is="dom-repeat" items="{{users.rows}}">
            <div class="table__row table__row--odd">
              <div class="table__cell table__cell--icon">
                <paper-icon-button
                  class="paper-icon-button"
                  icon="editor:mode-edit"
                  on-tap="_handleEdit"
                ></paper-icon-button>
              </div>

              <div class="table__cell password-button">
                <paper-icon-button
                  class="paper-icon-button"
                  icon="communication:vpn-key"
                  on-tap="_handlePassword"
                ></paper-icon-button>
              </div>

              <div class="table__cell id">[[item.id]]</div>

              <div class="table__cell roles">
                <template as="item" is="dom-repeat" items="{{item.roles}}">
                  <li class="table__cell-list">[[item.role_name]]</li>
                </template>
              </div>

              <div class="table__cell">
                [[item.last_name]], [[item.first_name]]
              </div>
              <div class="table__cell">[[item.username]]</div>
              <div class="table__cell">[[item.email]]</div>
              <div class="table__cell">[[_formatDate(item.created)]]</div>
              <div class="table__cell">[[_formatDate(item.updated)]]</div>

              <div class="table__cell table__cell--icon">
                <paper-icon-button
                  class="paper-icon-button"
                  icon="delete"
                  on-tap="_handleRemove"
                ></paper-icon-button>
              </div>
            </div>
          </template>
        </div>
      </div>

      <div class="card">
        <my-pagination
          current-page="{{currentPage}}"
          items-total="{{users.totalCount}}"
          page-size="{{pageSize}}"
        ></my-pagination>
      </div>

      <paper-dialog class="dialog" id="dialogConfirm" modal with-backdrop>
        <h2>Confirmation</h2>

        <p>
          Are you sure you want to remove
          <strong>User #[[details.item.id]]</strong>?
        </p>

        <div class="dialog__footer">
          <paper-button
            class="dialog__button"
            data-option="no"
            dialog-dismiss
            on-tap="_handleDialogConfirm"
            raised
          >
            <iron-icon icon="icons:close"></iron-icon>
            <span class="dialog__span">No</span>
          </paper-button>

          <paper-button
            autofocus
            class="dialog__button"
            data-option="yes"
            dialog-confirm
            on-tap="_handleDialogConfirm"
            raised
          >
            <iron-icon icon="icons:check"></iron-icon>
            <span class="dialog__span">Yes</span>
          </paper-button>
        </div>
      </paper-dialog>

      <paper-dialog class="dialog" id="dialogPassword" modal with-backdrop>
        <h2>
          <iron-icon class="modal-icon" icon="social:person"></iron-icon>
          [[details.item.last_name]], [[details.item.first_name]]
        </h2>

        <div class="dialog__body">
          <paper-input
            auto-validate
            error-message="[[validationError]]"
            id="newPassword"
            label="New Password"
            name="newPassword"
            on-keyup="_handleKeyUp"
            type="password"
            validator="passwordValidator"
          ></paper-input>
        </div>

        <div class="dialog__footer">
          <paper-button
            class="dialog__button"
            data-option="no"
            dialog-dismiss
            on-tap="_handlePasswordConfirm"
            raised
          >
            <iron-icon icon="icons:close"></iron-icon>
            <span class="dialog__span">Close</span>
          </paper-button>

          <paper-button
            class="dialog__button"
            data-option="yes"
            disabled$="[[!isValid]]"
            id="passwordSubmit"
            on-tap="_handlePasswordConfirm"
            raised
          >
            <iron-icon icon="av:loop"></iron-icon>
            <span class="dialog__span">Change</span>
          </paper-button>
        </div>
      </paper-dialog>

      <paper-spinner class="spinner" id="spinner"></paper-spinner>

      <my-password-validator
        error-message="{{validationError}}"
        is-valid="{{isValid}}"
        mode="[[mode]]"
        validator-name="passwordValidator"
      ></my-password-validator>

      <iron-ajax
        content-type="application/json"
        debounce-duration="300"
        id="ajax"
        with-credentials
      ></iron-ajax>
    `;
  }

  static get is() {
    return 'my-user';
  }

  static get properties() {
    return {
      config: {
        type: Object,
        value: MyAppGlobals.config,
      },
      currentPage: {
        notify: true,
        type: Number,
      },
      details: {
        type: Object,
        value: () => {
          return {};
        },
      },
      mode: String,
      orderBy: {
        type: Object,
        value: () => {
          return {
            column: 'created',
            direction: 'desc',
          };
        },
      },
      pageSize: {
        notify: true,
        type: Number,
      },
      roles: {
        notify: true,
        type: Array,
      },
      search: {
        type: Object,
        value: () => {
          return {
            endDate: '',
            startDate: '',
            term: '',
          };
        },
      },
      tab: {
        type: Number,
        value: 0,
      },
      user: {
        notify: true,
        type: Object,
        value: () => JSON.parse(localStorage.getItem('user')),
      },
      users: Array,
    };
  }

  connectedCallback() {
    super.connectedCallback();

    this._attachListeners();
    this._attachObservers();

    this._getRoles();
    this._read();
  }

  /**
   * Attach observers
   */
  _attachObservers() {
    this._createPropertyObserver('currentPage', '_read', true);
    this._createPropertyObserver('pageSize', '_read', true);
  }

  /**
   * Attach listeners
   */
  _attachListeners() {
    document.addEventListener('page-changed', (event) =>
      this._handlePageChange(event)
    );
  }

  /**
   * Change mode
   * @param {string} mode
   */
  _changeMode(mode) {
    const span = this.shadowRoot.querySelector('#submit span');

    this.mode = mode === 'edit' ? 'edit' : 'create';

    span.innerHTML = this.mode;
  }

  /**
   * Change pane
   * @param {number} value
   */
  _changePane(value) {
    const paneA = this.$.paneA;
    const paneB = this.$.paneB;

    paneA.style.display = value ? 'none' : 'block';
    paneB.style.display = value ? 'block' : 'none';

    this.tab = value;

    this.search = {};

    this._changeMode();
    this._clear();
    this._read();
  }

  /**
   * Change password
   */
  _changePassword() {
    const ajax = this.$.ajax;
    const body = {
      password: this.$.newPassword.value,
    };

    ajax.body = body;
    ajax.method = 'post';
    ajax.params = {};
    ajax.url = `${this.config.api.origin}/${
      this.config.api.path
    }/users/password/${this.details.item.id}`;

    const request = ajax.generateRequest();

    request.completes.then(
      () => {
        this._clear();
        this._reset();

        this._message(
          'var(--paper-green-700)',
          'Password updated successfully.'
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
   * Clear
   */
  _clear() {
    if (this.tab === 0) {
      const form = this.$.create.serializeForm();

      delete form.roleValue;

      this.isValid = true;
      this.mode = null;

      this.$.password.setAttribute('required', true);
      this.$.password.style.display = 'block';

      for (const [key] of Object.entries(form)) {
        const element = this.$[key];

        if (key !== 'roles') {
          element.invalid = false;
          element.value = '';

          if (element.errorMessage) {
            element.errorMessage = '';
          }
        } else {
          this.selectedRoleValues = [];
          element.invalid = false;
        }

        this.validationError = '';

        this.$.create.reset();
      }
    } else {
      const form = this.$.search.serializeForm();

      for (const [key] of Object.entries(form)) {
        const id = key
          .split(/(?=[A-Z])/g)
          .map((value) => {
            return value.charAt(0).toLowerCase() + value.substring(1);
          })
          .join('-');

        if (this.$[id]) {
          this.$[id].invalid = false;
          this.$[id].value = '';
        }
      }

      this.$.search.reset();

      this.search = {};

      this._read();
    }

    this.$.newPassword.errorMessage = '';
    this.$.newPassword.invalid = false;
    this.$.newPassword.value = '';

    this.isValid = true;
  }

  /**
   * Delete
   */
  _delete() {
    const ajax = this.$.ajax;
    const itemId = this.details.item.id;

    ajax.body = {};
    ajax.method = 'delete';
    ajax.params = {};
    ajax.url = `${this.config.api.origin}/${
      this.config.api.path
    }/users/${itemId}`;

    const request = ajax.generateRequest();

    request.completes.then(
      () => {
        this._clear();
        this._reset();

        this._message('var(--paper-green-700)', 'User deleted successfully.');
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
   * Format date
   * @param {string} date
   * @return {string}
   */
  _formatDate(date) {
    const formatted = format(new Date(date), 'MMM dd, yyyy h:mm:ss a');

    return formatted;
  }

  /**
   * Get roles
   */
  _getRoles() {
    const ajax = this.$.ajax;

    ajax.body = {};
    ajax.method = 'get';
    ajax.params = {};
    ajax.url = `${this.config.api.origin}/${this.config.api.path}/roles`;

    const request = ajax.generateRequest();

    request.completes.then(
      (req) => {
        this.roles = req.response;
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
   * Handle clear
   */
  _handleClear() {
    this._changeMode();
    this._clear();
  }

  /**
   * Handle dialog confirm
   * @param {object} event
   */
  _handleDialogConfirm(event) {
    const option = event.currentTarget.dataset.option;

    if (option === 'yes') {
      this._delete();
    }

    this.details.item = {};
  }

  /**
   * Handle edit
   * @param {object} event
   */
  _handleEdit(event) {
    const item = event.model.item;
    const password = this.$.password;
    const span = this.shadowRoot.querySelector('#submit span');

    this._clear();

    if (this.tab !== 0) {
      this._changePane(0);
    }

    this._changeMode('edit');

    this.details = {
      item: item,
    };

    const roles = [];

    this.isValid = true;

    this.$.email.value = item.email;
    this.$.firstName.value = item.first_name;
    this.$.lastName.value = item.last_name;
    this.$.username.value = item.username;

    item.roles.forEach(function(role) {
      roles.push(role.role_id.toString());
    });

    this.selectedRoleValues = roles;

    span.innerHTML = 'Edit';

    password.removeAttribute('required');
    password.style.display = 'none';
  }

  /**
   * Handle key up
   * @param {object} event
   */
  _handleKeyUp(event) {
    if (event.keyCode !== 13) {
      return;
    }

    this.$.dialogPassword.opened
      ? this._handlePasswordConfirm()
      : this._handleSubmit();
  }

  /**
   * Handle label change
   * @param {object} event
   */
  _handleLabelChange(event) {
    const selectedItem = event.target.selectedItems[0];
    const selectedValues = event.target.selectedValues;

    let label = null;

    if (selectedValues.length > 1) {
      label = this.selectedRoleValues.length + ' items selected';
    } else if (selectedValues.length === 1 && selectedItem) {
      label = selectedItem.innerText.trim();
    }

    this.$.roles.invalid = !label;
    this.$.roles.value = label;
  }

  /**
   * Handle page change
   * @param {object} event
   */
  _handlePageChange(event) {
    if (event.detail.page === 'user') {
      this._changePane(0);
      this._read();
    }
  }

  /**
   * Handle password
   * @param {object} event
   */
  _handlePassword(event) {
    this.details = {
      item: event.model.item,
    };

    this._changeMode();
    this._clear();
    this._showDialog('dialogPassword');
  }

  /**
   * Handle password confirm
   */
  _handlePasswordConfirm() {
    if (!this.isValid) {
      return;
    }

    this._changePassword();

    this.$.dialogPassword.close();
  }

  /**
   * Handle refresh
   */
  _handleRefresh() {
    this.currentPage = 1;
    this.search = {};

    this._changeMode();
    this._clear();

    this._reset();

    this._read();
  }

  /**
   * Handle remove
   * @param {object} event
   */
  _handleRemove(event) {
    this.details = {
      item: event.model.item,
    };

    this._changeMode();
    this._clear();
    this._showDialog('dialogConfirm');
  }

  /**
   * Handle sort
   * @param {object} event
   */
  _handleSort(event) {
    const column = event.target.dataset.column;

    if (column === this.orderBy.column) {
      this.orderBy.direction =
        this.orderBy.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.orderBy.column = column;
      this.orderBy.direction = 'asc';
    }

    this._read();
  }

  /**
   * Handle submit
   */
  _handleSubmit() {
    if (this.tab === 0) {
      this.validationError = '';

      this._verifyUniqueness();
    } else {
      if (!this.$.search.validate()) {
        return;
      }

      const form = this.$.search.serializeForm();

      for (const [key, value] of Object.entries(form)) {
        this.search[key] = value;
      }

      this._reset();

      this._read();
    }
  }

  /**
   * Handle tabs
   * @param {object} event
   */
  _handleTabs(event) {
    this._changePane(event.detail.value);
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
   * Read
   */
  _read() {
    const ajax = this.$.ajax;

    const params = {
      limit: this.pageSize,
      offset: (this.currentPage - 1) * this.pageSize,
      column: this.orderBy.column,
      direction: this.orderBy.direction,
      search: JSON.stringify(this.search),
    };
    const spinner = this.$.spinner;

    spinner.active = true;

    ajax.body = {};
    ajax.method = 'get';
    ajax.params = params;
    ajax.url = `${this.config.api.origin}/${this.config.api.path}/users`;

    this._debouncer = Debouncer.debounce(
      this._debouncer,
      timeOut.after(),
      () => {
        const request = ajax.generateRequest();

        request.completes.then(
          (req) => {
            this.users = req.response;
            spinner.active = false;
          },
          () => {
            this._message(
              'var(--paper-red-700)',
              'Communication Error: Please refresh your browser.'
            );
          }
        );
      }
    );
  }

  /**
   * Reset
   */
  _reset() {
    this.details = {};
    this.orderBy.column = 'created';
    this.orderBy.direction = 'desc';

    this.currentPage !== 1 ? (this.currentPage = 1) : this._read();
  }

  /**
   * Show dialog
   * @param {string} selector
   */
  _showDialog(selector) {
    const body = document.querySelector('body');
    const dialog = this.$[selector];

    body.appendChild(dialog);

    dialog.open();

    if (selector === 'dialogPassword') {
      this.isValid = false;
    }
  }

  /**
   * Upsert
   * @param {string} option
   */
  _upsert(option) {
    const ajax = this.$.ajax;
    const form = this.$.create.serializeForm();

    const user = {
      email: form.email,
      firstName: form.firstName,
      lastName: form.lastName,
      roles: JSON.stringify(form.roleValue.split(',')),
      username: form.username,
    };

    if (this.mode !== 'edit') {
      user.password = form.password;
    }

    const url = `${this.config.api.origin}/${this.config.api.path}/users`;

    ajax.body = user;
    ajax.method = option === 'create' ? 'post' : 'put';
    ajax.params = {};
    ajax.url = option === 'create' ? url : url + `/${this.details.item.id}`;

    const request = ajax.generateRequest();

    request.completes.then(
      (req) => {
        const response = req.response;

        if (this.mode === 'edit') {
          if (this.user.id === response.id) {
            this.user = response;

            this.user.roles = this.user.roles.map(function(role) {
              return role.role_name;
            });

            this.dispatchEvent(
              new CustomEvent('update-user', {
                bubbles: true,
                detail: {
                  user: this.user,
                },
              })
            );
          }

          this.details.item = {};
        }

        this._changeMode();
        this._clear();
        this._reset();

        const operation = option === 'create' ? 'created' : 'updated';

        this._message(
          'var(--paper-green-700)',
          `User ${operation} successfully.`
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

    let verified = this.$.create.validate();

    checkEmail.then((value) => {
      if (
        (Object.keys(this.details).length === 0 ||
          value.id !== this.details.item.id) &&
        value
      ) {
        verified = false;

        email.errorMessage = 'Must be unique.';
        email.invalid = true;
      }
    });

    checkUsername.then((value) => {
      if (
        (Object.keys(this.details).length === 0 ||
          value.id !== this.details.item.id) &&
        value
      ) {
        verified = false;

        username.errorMessage = 'Must be unique.';
        username.invalid = true;
      }
    });

    Promise.all([checkEmail, checkUsername]).then(() => {
      if (verified) {
        this.mode === 'edit' ? this._upsert('update') : this._upsert('create');
      }
    });
  }
}

window.customElements.define(MyUser.is, MyUser);
