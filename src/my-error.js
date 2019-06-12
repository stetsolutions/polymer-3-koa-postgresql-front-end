import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';

class MyError extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
          padding: 10px 20px;
        }
      </style>

      <h1>404. That's an error.</h1>
      <h2>The requested URL was not found on this server.</h2>
      <h3><a href$="[[rootPath]]">Head back to home.</a></h3>
    `;
  }

  static get is() {
    return 'my-error';
  }
}

window.customElements.define(MyError.is, MyError);
