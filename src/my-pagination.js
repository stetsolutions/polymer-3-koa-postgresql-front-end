import {timeOut} from '@polymer/polymer/lib/utils/async.js';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce.js';
import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';

import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-input/iron-input.js';

import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-menu-button/paper-menu-button.js';

import './shared-style.js';

class MyPagination extends PolymerElement {
  static get template() {
    return html`
      <style include="shared-styles">
        :host {
          display: block;
        }

        .container {
          @apply --layout-center;
          @apply --layout-horizontal;
          @apply --layout-justified;
          @apply --layout-wrap;
        }

        .container__left {
          @apply --layout-horizontal;
          @apply --layout-wrap;
        }

        .button {
          margin-left: 0;
          margin-right: 8px;
          min-width: 36px;
          padding: 0;
        }

        .button__arrow {
          padding: 0px 2px;
          width: 19px;
        }

        .total {
          @apply --layout;
          @apply --layout-center-center;
          margin-right: 8px;
        }

        .menu {
          font-weight: normal;
          padding-left: 0;
        }

        .menu__button {
          margin-left: 0;
          padding-right: 0;
        }

        .menu__icon {
          margin-left: auto;
        }

        .input {
          border: 1px solid #ccc;
          border-radius: 4px;
          box-sizing: border-box;
          font-size: 16px;
          height: 36px;
          margin: 0 2px;
          padding: 4px 8px;
          width: 75px;
        }

        .listbox {
          --paper-listbox: {
            padding: 0px 0px;
          }
        }

        .listbox__item {
          font-size: 16px;
          --paper-item : {
            cursor: pointer;
          }
        }

        @media only screen and (min-width: 1080px) {
          .menu {
            padding: 0;
          }
        }
      </style>

      <div class="container">
        <div class="container__left">
          <paper-button
            class="button"
            data-option="start"
            disabled$="[[_disablePrevious]]"
            on-tap="_handleButton"
            raised
          >
            <iron-icon icon="icons:first-page"></iron-icon>
          </paper-button>

          <paper-button
            class="button"
            data-option="previous"
            disabled$="[[_disablePrevious]]"
            on-tap="_handleButton"
            raised
          >
            <iron-icon
              class="button__arrow"
              icon="icons:arrow-back"
            ></iron-icon>
          </paper-button>

          <iron-input
            allowed-pattern="[0-9]"
            bind-value="[[currentPage]]"
            on-keyup="_handleInputChange"
            prevent-invalid-input
          >
            <input class="input" />
          </iron-input>

          <span class="total" hidden$="[[_pagesTotal]]">
            / [[_pagesTotal]]
          </span>

          <paper-button
            class="button"
            data-option="next"
            disabled$="[[_disableNext]]"
            on-tap="_handleButton"
            raised
          >
            <iron-icon
              class="button__arrow"
              icon="icons:arrow-forward"
            ></iron-icon>
          </paper-button>

          <paper-button
            class="button"
            data-option="end"
            disabled$="[[_disableNext]]"
            on-tap="_handleButton"
            raised
          >
            <iron-icon icon="icons:last-page"></iron-icon>
          </paper-button>
        </div>

        <div class="container__middle">
          <paper-menu-button
            class="menu"
            close-on-activate
            horizontal-align="right"
            horizontal-offset="31"
            vertical-align="bottom"
          >
            <paper-button
              class="menu__button"
              noink
              raised
              slot="dropdown-trigger"
            >
              {{pageSize}}
              <iron-icon
                class="menu__icon"
                icon="icons:arrow-drop-down"
              ></iron-icon>
            </paper-button>

            <paper-listbox
              attr-for-selected="data-value"
              class="listbox"
              selected="{{pageSize}}"
              slot="dropdown-content"
            >
              <template as="item" is="dom-repeat" items="[[pageOptions]]">
                <paper-item class="listbox__item" data-value$="[[item]]">
                  [[item]]
                </paper-item>
              </template>
            </paper-listbox>
          </paper-menu-button>

          <span> items per page </span>
        </div>

        <div class="container__right">
          <span> [[_itemStart]] ~ [[_itemEnd]] of [[itemsTotal]] items </span>
        </div>
      </div>
    `;
  }

  static get is() {
    return 'my-pagination';
  }

  static get properties() {
    return {
      currentPage: {
        notify: true,
        observer: '_handleCurrentPageChange',
        reflectToAttribute: true,
        type: Number,
      },
      itemsTotal: {
        notify: true,
        observer: '_handleItemsTotalChange',
        type: Number,
        value: 0,
      },
      pageOptions: {
        type: Array,
        value: () => [1, 5, 10, 25, 50, 100],
      },
      pageSize: {
        notify: true,
        observer: '_handlePageSizeChange',
        reflectToAttribute: true,
        type: Number,
        value: 5,
      },
      _debouncer: Object,
      _disableNext: Boolean,
      _disablePrevious: Boolean,
      _itemEnd: {
        type: Number,
        value: 0,
      },
      _itemStart: {
        type: Number,
        value: 0,
      },
      _pagesTotal: {
        notify: true,
        type: Number,
        value: 0,
      },
    };
  }

  /**
   * Handle button
   * @param {object} event
   */
  _handleButton(event) {
    const option = event.currentTarget.dataset.option;

    switch (option) {
      case 'next':
        if (this.currentPage < this.itemsTotal / this.pageSize) {
          this.currentPage = Number(this.currentPage) + 1;
        }
        break;

      case 'previous':
        if (this.currentPage !== 1) {
          this.currentPage = Number(this.currentPage) - 1;
        }
        break;

      case 'start':
        this.currentPage = 1;
        break;

      case 'end':
        this.currentPage = this._pagesTotal;
        break;
    }
  }

  /**
   * Handle current page change
   */
  _handleCurrentPageChange() {
    const currentPage = Number(this.currentPage);

    this._disableNext =
      this._pagesTotal <= 1 || currentPage === this._pagesTotal;
    this._disablePrevious = currentPage === 1 || this._pagesTotal < 1;

    this._setIndicator();
  }

  /**
   * Handle input change
   * @param {object} event
   */
  _handleInputChange(event) {
    const currentTarget = event.currentTarget;

    this._debouncer = Debouncer.debounce(
      this._debouncer,
      timeOut.after(),
      () => {
        if (currentTarget.value < 1 || currentTarget.value > this._pagesTotal) {
          this.currentPage = 1;
          currentTarget.bindValue = 1;
        } else {
          this.currentPage = currentTarget.value;
        }
      }
    );
  }

  /**
   * Handle items total change
   */
  _handleItemsTotalChange() {
    this._pagesTotal = Math.ceil(this.itemsTotal / this.pageSize);

    this._handleCurrentPageChange();
  }

  /**
   * Handle page size change
   */
  _handlePageSizeChange() {
    this.currentPage = 1;

    this._handleItemsTotalChange();
  }

  /**
   * Set indicator
   */
  _setIndicator() {
    this._itemStart = (this.currentPage - 1) * this.pageSize;

    const itemCount = Number(this._itemStart) + Number(this.pageSize);

    this._itemEnd =
      itemCount >= this.itemsTotal
        ? this.itemsTotal
        : (this._itemEnd = itemCount);
  }
}

window.customElements.define(MyPagination.is, MyPagination);
