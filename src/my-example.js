import {format} from 'date-fns';

import {timeOut} from '@polymer/polymer/lib/utils/async.js';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce.js';
import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';

import '@polymer/iron-ajax/iron-ajax.js';
import '@polymer/iron-form/iron-form.js';
import '@polymer/iron-icons/editor-icons.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-image/iron-image.js';

import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-spinner/paper-spinner.js';

import './my-pagination.js';
import './shared-style.js';

class MyExample extends PolymerElement {
  static get template() {
    return html`
      <style include="shared-styles">
        :host {
          display: block;
        }

        .grid {
          display: grid;
          grid-gap: 16px;
          grid-template-columns: minmax(200px, 1fr);
        }

        .button {
          margin: 20px 10px 0 0;
        }

        .file {
          display: none;
        }

        .upload {
          text-align: center;
        }

        .upload__preview {
          line-height: 0;
          text-align: center;
        }

        .upload__image {
          vertical-align: middle;
        }

        .upload__button--error {
          border: 2px solid
            var(--paper-input-container-invalid-color, var(--error-color));
          color: var(--paper-input-container-invalid-color, var(--error-color));
        }

        @media only screen and (min-width: 1080px) {
          .grid {
            grid-template-columns: repeat(2, minmax(200px, 1fr));
          }
        }

        @media only screen and (min-width: 1280px) {
          .grid {
            grid-template-columns: repeat(4, minmax(200px, 1fr));
          }
        }
      </style>

      <div class="card">
        <iron-form class="form" id="form">
          <form on-keyup="_handleKeyUp">
            <div class="grid">
              <paper-input
                data-column="name"
                id="name"
                label="Name"
                name="name"
                required
              ></paper-input>

              <div class="upload">
                <div class="upload__preview">
                  <iron-image
                    class="upload__image"
                    id="image"
                    preload
                  ></iron-image>
                </div>
              </div>
            </div>

            <paper-button
              class="button"
              id="submit"
              on-tap="_handleSubmit"
              raised
            >
              <iron-icon icon="icons:add"></iron-icon>
              <span class="button__text">Submit</span>
            </paper-button>

            <paper-button
              class="button"
              id="clear"
              on-tap="_handleClear"
              raised
            >
              <iron-icon icon="icons:clear"></iron-icon>
              <span class="button__text">Clear</span>
            </paper-button>

            <paper-button
              class="upload__button button"
              id="upload"
              on-tap="_handleUpload"
              raised
            >
              <iron-icon icon="icons:file-upload"></iron-icon>
              <span class="button__text">Image</span>
              <input
                accept="
                  image/gif,
                  image/jpeg,
                  image/png,
                  image/svg+xml
                "
                class="file"
                id="file"
                name="file"
                on-change="_handleFile"
                required
                type="file"
                value="{{value::input}}"
              />
            </paper-button>
          </form>
        </iron-form>
      </div>

      <div class="card">
        <div class="table">
          <div class="table__header">
            <div class="table__cell table__cell--icon"></div>
            <div
              class="table__cell table__cell--id table__cell--sort"
              data-column="id"
              on-tap="_handleSort"
            >
              #
            </div>
            <div
              class="table__cell table__cell--sort"
              data-column="name"
              on-tap="_handleSort"
            >
              Name
            </div>
            <div class="table__cell">Image</div>
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

          <template is="dom-repeat" items="{{examples.rows}}">
            <div class="table__row table__row--odd">
              <div class="table__cell table__cell--icon">
                <paper-icon-button
                  class="paper-icon-button"
                  icon="editor:mode-edit"
                  on-tap="_handleEdit"
                ></paper-icon-button>
              </div>
              <div class="table__cell  table__cell--id">[[item.id]]</div>
              <div class="table__cell">[[item.name]]</div>
              <div class="table__cell">
                <iron-image
                  class="table__image"
                  preload
                  sizing="contain"
                  src="[[config.api.origin]]/assets/images/[[item.image]]"
                ></iron-image>
              </div>
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
          items-total="{{examples.totalCount}}"
          page-size="{{pageSize}}"
        ></my-pagination>
      </div>

      <paper-dialog class="dialog" id="dialogConfirm" modal with-backdrop>
        <h2>Confirmation</h2>
        <p>
          Are you sure you want to remove
          <strong>Example #[[details.item.id]]</strong>?
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

      <paper-spinner class="spinner" id="spinner"></paper-spinner>

      <iron-ajax
        content-type="application/json"
        debounce-duration="300"
        id="ajax"
        with-credentials
      ></iron-ajax>
    `;
  }

  static get is() {
    return 'my-example';
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
      dimensions: {
        type: Object,
        value: () => {
          return {
            height: 200,
            width: 200,
          };
        },
      },
      examples: Array,
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
      _debouncer: Object,
    };
  }

  connectedCallback() {
    super.connectedCallback();

    this._attachObservers();

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
   * Change mode
   * @param {string} mode
   */
  _changeMode(mode) {
    const span = this.shadowRoot.querySelector('#submit span');

    this.mode = mode === 'edit' ? 'edit' : 'submit';

    span.innerHTML = this.mode;
  }

  /**
   * Clear
   */
  _clear() {
    const file = this.$.file;
    const name = this.$.name;
    const uploadButton = this.$.upload;
    const uploadImage = this.$.image;

    file.setAttribute('required', true);

    file.invalid = false;
    file.value = null;

    name.invalid = false;
    name.value = null;

    uploadButton.classList.remove('upload__button--error');
    uploadImage.src = '';

    this.$.form.reset();
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
    }/examples/${itemId}`;

    const request = ajax.generateRequest();

    request.completes.then(
      () => {
        this._reset();

        this._message(
          'var(--paper-green-700)',
          'Example deleted successfully.'
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
   * Format date
   * @param {string} date
   * @return {string}
   */
  _formatDate(date) {
    const formatted = format(new Date(date), 'MMM dd, yyyy h:mm:ss a');

    return formatted;
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

    this.details = {};
  }

  /**
   * Handle edit
   * @param {object} event
   */
  _handleEdit(event) {
    const file = this.$.file;
    const name = this.$.name;
    const uploadImage = this.$.image;

    this._changeMode('edit');
    this._clear();

    this.details = {
      item: event.model.item,
    };

    file.removeAttribute('required');

    name.value = this.details.item.name;

    uploadImage.src = `${this.config.api.origin}/assets/images/${
      this.details.item.image
    }`;
  }

  /**
   * Handle file
   * @param {object} event
   */
  _handleFile(event) {
    const file = event.currentTarget;

    if (!file.files[0]) {
      return;
    }

    const imageType = /image.*/;
    const uploadButton = this.$.upload;
    const uploadImage = this.$.image;

    uploadImage.src = '';

    this.$.file.setAttribute('required', true);

    if (!file.files[0].type.match(imageType)) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.src = reader.result;

      img.onload = () => {
        if (
          img.height > this.dimensions.height ||
          img.width > this.dimensions.width
        ) {
          file.value = null;

          uploadButton.classList.add('upload__button--error');

          this._message(
            'var(--paper-red-700)',
            `Must not exceed maximum dimensions (${
              this.dimensions.height
            }px x ${this.dimensions.width}px).`
          );

          uploadImage.src = '';
        } else {
          uploadButton.classList.remove('upload__button--error');
          uploadImage.src = reader.result;
        }
      };
    };

    reader.readAsDataURL(file.files[0]);
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
   * Handle remove
   * @param {object} event
   */
  _handleRemove(event) {
    this.details = {
      item: event.model.item,
    };

    this._changeMode();
    this._clear();
    this._showDialog();
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
    const file = this.$.file;
    const name = this.$.name;

    let verified = this.$.form.validate();

    if (!file.validity.valid) {
      this.$.upload.classList.add('upload__button--error');

      verified = false;
    }

    if (name.value) {
      name.value = name.value.trim();
    }

    const request = this._verifyUniqueness(name);

    if (request === undefined) {
      return;
    }

    request
      .then(() => {
        if (verified && !name.invalid) {
          this.mode === 'edit'
            ? this._upsert('update')
            : this._upsert('create');
        }
      })
      .catch((error) => {
        console.log('Error: ' + error);
      });
  }

  /**
   * Handle upload
   */
  _handleUpload() {
    this.$.file.click();
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
    };
    const spinner = this.$.spinner;

    this.$.spinner.active = true;

    ajax.body = {};
    ajax.method = 'get';
    ajax.params = params;
    ajax.url = `${this.config.api.origin}/${this.config.api.path}/examples`;

    this._debouncer = Debouncer.debounce(
      this._debouncer,
      timeOut.after(),
      () => {
        const request = ajax.generateRequest();

        request.completes.then(
          (req) => {
            this.examples = req.response;

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
    this.orderBy.column = 'created';
    this.orderBy.direction = 'desc';

    this._changeMode();

    this.currentPage !== 1 ? (this.currentPage = 1) : this._read();
  }

  /**
   * Show dialog
   */
  _showDialog() {
    const body = document.querySelector('body');
    const dialog = this.$.dialogConfirm;

    body.appendChild(dialog);

    dialog.open();
  }

  /**
   * Upsert
   * @param {string} option
   */
  _upsert(option) {
    const ajax = this.$.ajax;
    const file = this.$.file.files[0];
    const formData = new FormData();
    const serializedForm = this.$.form.serializeForm();

    for (const [key, value] of Object.entries(serializedForm)) {
      formData.append(key, value);
    }

    formData.append(file, file);

    const url = `${this.config.api.origin}/${this.config.api.path}/examples`;

    ajax.body = formData;
    ajax.contentType = undefined;
    ajax.method = option === 'create' ? 'post' : 'put';
    ajax.params = {};
    ajax.url = option === 'create' ? url : url + `/${this.details.item.id}`;

    const request = ajax.generateRequest();

    request.completes.then(
      () => {
        this._clear();
        this._reset();

        const operation = option === 'create' ? 'created' : 'updated';

        this._message(
          'var(--paper-green-700)',
          `Example ${operation} successfully.`
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
   * @param {object} element
   * @return {promise}
   */
  _verifyUniqueness(element) {
    if (!element.value) {
      return;
    }

    const ajax = this.$.ajax;
    const column = element.dataset.column;
    const value = element.value.trim();

    ajax.body = {};
    ajax.method = 'get';
    ajax.params = {};
    ajax.url = `${this.config.api.origin}/${
      this.config.api.path
    }/examples/${column}/${value}`;

    return new Promise((resolve) => {
      const request = ajax.generateRequest();

      request.completes.then(
        (req) => {
          if (this.mode === 'edit' && req.response) {
            element.invalid =
              this.details.item.id !== req.response.id &&
              this.details.item[column] !== req.response[column];
          } else {
            element.invalid = Boolean(req.response);
          }

          if (element.invalid) {
            element.errorMessage = 'Must be unique.';
            element.invalid = true;
          }

          resolve();
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
}

window.customElements.define(MyExample.is, MyExample);
