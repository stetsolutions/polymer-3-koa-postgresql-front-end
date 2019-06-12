import {
  setPassiveTouchGestures,
  setRootPath,
} from '@polymer/polymer/lib/utils/settings.js';
import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';

import '@polymer/app-layout/app-drawer/app-drawer.js';
import '@polymer/app-layout/app-drawer-layout/app-drawer-layout.js';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-header-layout/app-header-layout.js';
import '@polymer/app-layout/app-scroll-effects/app-scroll-effects.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
import '@polymer/app-route/app-location.js';
import '@polymer/app-route/app-route.js';

import '@polymer/iron-ajax/iron-ajax.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/iron-icons/communication-icons.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icons/social-icons.js';
import '@polymer/iron-pages/iron-pages.js';
import '@polymer/iron-selector/iron-selector.js';

import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-menu-button/paper-menu-button.js';
import '@polymer/paper-toast/paper-toast.js';

import './my-icon.js';

setPassiveTouchGestures(true);
setRootPath(MyAppGlobals.rootPath);

class MyApp extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
          --app-drawer-width: 200px;
          --app-primary-color: #2d68c4;
          --app-secondary-color: #000;
        }

        .drawer-layout:not([narrow]) [drawer-toggle] {
          display: none;
        }

        .drawer__header:not([hidden]) {
          @apply --layout;
          @apply --layout-center;
          background-color: var(--app-primary-color);
          box-sizing: border-box;
          color: #fff;
          height: 64px;
          padding: 14px;
          width: 100%;
        }

        .drawer__username {
          font-size: 18px;
          font-weight: 400;
          padding-left: 5px;
        }

        .drawer__list {
          margin-bottom: 20px;
        }

        .drawer__icon {
          padding-bottom: 3px;
        }

        .drawer__anchor:not([hidden]) {
          color: var(--app-secondary-color);
          display: block;
          line-height: 40px;
          padding: 0 15px;
          text-decoration: none;
        }

        .drawer__anchor.iron-selected {
          color: #000;
          font-weight: bold;
        }

        .drawer__anchor:hover {
          font-weight: bold;
        }

        .drawer__anchor:focus {
          outline: none;
        }

        .drawer__title {
          padding-left: 3px;
        }

        .drawer__rule {
          border-style: ridge;
        }

        .header {
          background-color: var(--app-primary-color);
          color: #fff;
        }

        .header__title {
          padding-left: 5px;
        }

        .header__hamburger {
          --paper-icon-button-ink-color: #fff;
        }

        .header__icon {
          padding-bottom: 3px;
        }

        .header__menu {
          display: none;
        }

        .header__button {
          margin-right: 0;
          padding-right: 0;
          text-transform: none;
          white-space: nowrap;
          --paper-button-flat-keyboard-focus: {
            font-weight: normal;
          }
        }

        .header__username {
          font-size: 18px;
          padding: 0 5px;
        }

        .header__link {
          color: #000;
          text-decoration: none;
          white-space: nowrap;
        }

        .header__link:focus {
          outline: none;
        }

        .header__item:hover {
          background-color: #eceaec;
        }

        .header__option {
          padding-left: 3px;
        }

        @media only screen and (min-width: 640px) {
          .header__menu {
            display: inline-block;
            padding-right: 0;
          }
        }
      </style>

      <app-location
        route="{{route}}"
        url-space-regex="^[[rootPath]]"
      ></app-location>

      <app-route
        data="{{routeData}}"
        pattern="[[rootPath]]:page"
        route="{{route}}"
        tail="{{subroute}}"
      ></app-route>

      <app-drawer-layout
        class="drawer-layout"
        force-narrow="[[!authenticated]]"
        fullbleed
        narrow="{{narrow}}"
      >
        <app-drawer
          class="drawer"
          hidden$="[[!authenticated]]"
          id="drawer"
          slot="drawer"
          swipe-open="[[narrow]]"
        >
          <div class="drawer__header" hidden$="[[!narrow]]">
            <iron-icon icon="icons:account-circle"></iron-icon
            ><span class="drawer__username">[[user.username]]</span>
          </div>

          <app-toolbar>SS Simple 1.0.0</app-toolbar>

          <iron-selector
            attr-for-selected="name"
            class="drawer__list"
            role="navigation"
            selected="[[page]]"
          >
            <a
              class="drawer__anchor"
              href$="[[rootPath]]dashboard"
              name="dashboard"
            >
              <iron-icon
                class="drawer__icon"
                icon="[[_getDetail('dashboard', 'icon')]]"
              ></iron-icon
              ><span class="drawer__title"
                >[[_getDetail('dashboard', 'title')]]</span
              >
            </a>

            <a
              class="drawer__anchor"
              href$="[[rootPath]]example"
              name="example"
              style$="display:{{_authorized('example', 'block')}}"
            >
              <iron-icon
                class="drawer__icon"
                icon="[[_getDetail('example', 'icon')]]"
              ></iron-icon
              ><span class="drawer__title"
                >[[_getDetail('example', 'title')]]</span
              >
            </a>

            <a
              class="drawer__anchor"
              href$="[[rootPath]]user"
              name="user"
              style$="display:{{_authorized('user', 'block')}}"
            >
              <iron-icon
                class="drawer__icon"
                icon="[[_getDetail('user', 'icon')]]"
              ></iron-icon
              ><span class="drawer__title"
                >[[_getDetail('user', 'title')]]</span
              >
            </a>

            <hr class="drawer__rule" hidden$="[[!narrow]]" />

            <a
              class="drawer__anchor"
              hidden$="[[!narrow]]"
              href$="[[rootPath]]change-password"
              name="change-password"
            >
              <iron-icon
                class="drawer__icon"
                icon="[[_getDetail('change-password', 'icon')]]"
              ></iron-icon
              ><span class="drawer__title"
                >[[_getDetail('change-password', 'title')]]</span
              >
            </a>

            <a
              class="drawer__anchor"
              hidden$="[[!narrow]]"
              href$="[[rootPath]]edit-profile"
            >
              <iron-icon
                class="drawer__icon"
                icon="[[_getDetail('edit-profile', 'icon')]]"
                name="edit-profile"
              ></iron-icon
              ><span class="drawer__title"
                >[[_getDetail('edit-profile', 'title')]]</span
              >
            </a>

            <a
              class="drawer__anchor"
              hidden$="[[!narrow]]"
              href$="[[rootPath]]login"
              on-tap="_handleLogout"
            >
              <iron-icon class="drawer__icon" icon="icons:lock"></iron-icon
              ><span class="drawer__title">Logout</span>
            </a>
          </iron-selector>
        </app-drawer>

        <app-header-layout has-scrolling-region>
          <app-header
            class="header"
            condenses
            effects="waterfall"
            reveals
            slot="header"
          >
            <app-toolbar>
              <paper-icon-button
                class="header__hamburger"
                drawer-toggle
                hidden$="[[!authenticated]]"
                icon="my-icons:menu"
              ></paper-icon-button>

              <div main-title>
                <iron-icon
                  class="header__icon"
                  hidden$="[[narrow]]"
                  icon="[[_getDetail(page, 'icon')]]"
                ></iron-icon
                ><span class="header__title"
                  >[[_getDetail(page, 'title')]]</span
                >
              </div>

              <paper-menu-button
                class="header__menu"
                close-on-activate
                hidden$="[[narrow]]"
                horizontal-align="right"
                vertical-align="top"
                vertical-offset="60"
              >
                <paper-button
                  class="header__button"
                  hidden$="[[!authenticated]]"
                  noink
                  slot="dropdown-trigger"
                >
                  <iron-icon icon="icons:account-circle"></iron-icon>
                  <span class="header__username">[[user.username]]</span>
                  <iron-icon icon="icons:arrow-drop-down"></iron-icon>
                </paper-button>

                <paper-listbox slot="dropdown-content">
                  <a class="header__link" href$="[[rootPath]]change-password">
                    <paper-item class="header__item">
                      <iron-icon
                        icon="[[_getDetail('change-password', 'icon')]]"
                      ></iron-icon>
                      <span class="header__option"
                        >[[_getDetail('change-password', 'title')]]</span
                      >
                    </paper-item>
                  </a>

                  <a class="header__link" href$="[[rootPath]]edit-profile">
                    <paper-item class="header__item">
                      <iron-icon
                        icon="[[_getDetail('edit-profile', 'icon')]]"
                      ></iron-icon>
                      <span class="header__option"
                        >[[_getDetail('edit-profile', 'title')]]</span
                      >
                    </paper-item>
                  </a>

                  <a
                    class="header__link"
                    href$="[[rootPath]]login"
                    on-tap="_handleLogout"
                  >
                    <paper-item class="header__item">
                      <iron-icon icon="icons:lock"></iron-icon>
                      <span class="header__option">Logout</span>
                    </paper-item>
                  </a>
                </paper-listbox>
              </paper-menu-button>
            </app-toolbar>
          </app-header>

          <iron-pages
            attr-for-selected="name"
            fallback-selection="error"
            on-update-user="_updateUser"
            role="main"
            selected="[[page]]"
          >
            <my-change-password name="change-password"></my-change-password>
            <my-dashboard name="dashboard"></my-dashboard>
            <my-edit-profile name="edit-profile"></my-edit-profile>
            <my-error name="error"></my-error>
            <my-example name="example"></my-example>
            <my-login name="login"></my-login>
            <my-user name="user"></my-user>
          </iron-pages>
        </app-header-layout>
      </app-drawer-layout>

      <iron-ajax
        content-type="application/json"
        debounce-duration="300"
        id="ajax"
        method="post"
        url="[[config.api.origin]]/[[config.api.path]]/logout"
        with-credentials
      ></iron-ajax>
    `;
  }

  static get is() {
    return 'my-app';
  }

  static get properties() {
    return {
      authenticated: Boolean,
      config: {
        type: Object,
        value: MyAppGlobals.config,
      },
      page: {
        observer: '_pageChanged',
        reflectToAttribute: true,
        type: String,
      },
      pages: {
        type: Object,
        value: () => {
          return {
            'change-password': {
              authorization: ['admin', 'user'],
              icon: 'communication:vpn-key',
              title: 'Change Password',
            },
            dashboard: {
              authorization: ['admin', 'user'],
              icon: 'icons:dashboard',
              title: 'Dashboard',
            },
            'edit-profile': {
              authorization: ['admin', 'user'],
              icon: 'social:person',
              title: 'Edit Profile',
            },
            error: {
              authorization: ['admin', 'user'],
              icon: 'icons:error',
              title: 'Error 404 (not found)',
            },
            example: {
              authorization: ['admin'],
              icon: 'icons:change-history',
              title: 'Example',
            },
            login: {
              authorization: ['admin', 'user'],
              icon: 'icons:lock-open',
              title: 'SS Simple Front-end',
            },
            user: {
              authorization: ['admin', 'user'],
              icon: 'social:group',
              title: 'Users',
            },
          };
        },
      },
      subroute: String,
      user: {
        type: Object,
        value: () => JSON.parse(localStorage.getItem('user')),
      },
    };
  }

  static get observers() {
    return ['_routePageChanged(routeData.page)'];
  }

  /**
   * Authorized
   * @param {string} page
   * @param {string} option
   * @return {boolean|string}
   */
  _authorized(page, option) {
    if (!this.user || !this.pages[page]) {
      return;
    }

    const userRoles = this.user.roles;
    const viewRoles = this.pages[page].authorization;

    let result = true;

    if (viewRoles) {
      result = userRoles.some((v) => viewRoles.includes(v));

      if (option) {
        result = result ? option : 'none';
      }
    }

    return result;
  }

  /**
   * Get detail
   * @param {string} page
   * @param {string} option
   * @return {string}
   */
  _getDetail(page, option) {
    const detail =
      option === 'icon' ? this.pages[page].icon : this.pages[page].title;

    return detail;
  }

  /**
   * Handle logout
   */
  _handleLogout() {
    const ajax = this.$.ajax;

    ajax.body = {};

    const request = ajax.generateRequest();

    this.user = null;

    request.completes.then(
      () => {
        localStorage.clear();
      },
      () => {
        this._message(
          'var(--paper-red-700)',
          'Unable to log out of server. Please log in and try again.'
        );
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

  /**
   * Page changed
   * @param {string} page
   */
  _pageChanged(page) {
    const pageName = `./my-${page}.js`;

    import(pageName).then(null, () => this._showError());
  }

  /**
   * Route page changed
   * @param {string} page
   */
  _routePageChanged(page) {
    if (!page) {
      page = 'dashboard';
    }

    this.authenticated = false;

    document.dispatchEvent(
      new CustomEvent('page-changed', {
        detail: {
          page: page,
        },
      })
    );

    if (this.user) {
      const diff = Date.now() - this.user.timestamp;
      const expiration = 12 * 60 * 60 * 1000;

      if (diff > expiration) {
        this._handleLogout();

        this.page = 'login';
      } else if (this._authorized(page)) {
        this.authenticated = true;
        this.page = page;
      } else {
        this.page = 'error';
      }
    } else {
      this.page = 'login';
    }

    if (!this.$.drawer.persistent) {
      this.$.drawer.close();
    }
  }

  /**
   * Show error
   */
  _showError() {
    this.page = 'error';
  }

  /**
   * Update user
   * @param {object} event
   */
  _updateUser(event) {
    this.user = event.detail.user;

    localStorage.setItem('user', JSON.stringify(this.user));
  }
}

window.customElements.define(MyApp.is, MyApp);
