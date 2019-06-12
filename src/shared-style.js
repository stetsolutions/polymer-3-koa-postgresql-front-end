import '@polymer/polymer/polymer-element.js';

const documentContainer = document.createElement('template');

documentContainer.innerHTML = `
  <dom-module id="shared-styles">
    <template>
      <style>
        .button {
          border: 2px solid transparent;
          height: 36px;
        }

        .button__text {
          padding: 0 5px;
        }

        .card {
          background-color: #fff;
          border-radius: 2px;
          box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
            0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
          margin: 16px;
          overflow: auto;
          padding: 16px;
        }

        .image {
          @apply --layout;
          @apply --layout-center-center;
          height: 100%;
          width: 100%;
        }

        .image-wrapper {
          border: 1px solid #f0f0f0;
          padding: 8px;
        }

        .image-wrapper--secondary {
          height: 150px;
          margin: 0 16px 16px 0;
          width: 150px;
        }

        .image-wrapper--primary {
          height: 200px;
          width: 200px;
        }

        .item__image {
          background-color: #fff;
          border: 1px solid #f0f0f0;
          height: 25px;
          padding: 2px;
          width: 25px;
        }

        .listbox__item {
          cursor: pointer;
          white-space: nowrap;
          --paper-item-focused-before: {
            opacity: 0;
          }
        }

        .listbox__item:hover {
          background-color: #eceaec;
        }

        .spinner {
          display: none;
        }

        .spinner[active] {
          display: block;
          left: 50%;
          margin-left: -25px;
          margin-top: -25px;
          position: fixed;
          top: 50%;
        }

        .tabs {
          margin-bottom: 16px;
          text-transform: capitalize;
          --paper-tabs-content: {
            font-weight: 400;
          }
        }

        .tabs__tab {
          border-bottom: 1px solid #ccc;
          border-radius: 2px 2px 0 0;
          box-sizing: border-box;
          text-transform: uppercase;
          --paper-tab-ink: #c0c0c0;
        }

        .tabs__tab.iron-selected {
          border: 1px solid #ccc;
          border-bottom: none;
          font-weight: 700;
        }

        .table {
          overflow: auto;
        }

        .table__header,
        .table__row {
          display: table-row;
          width: 100%;
        }

        .table__header,
        .table__row--odd:nth-child(odd),
        .table__row--even:nth-child(even) {
          background: #eaeaea;
        }

        .table__cell {
          color: #333;
          display: table-cell;
          font-size: 15px;
          overflow: hidden;
          padding: 10px;
          text-overflow: ellipsis;
          vertical-align: middle;
          width: 1000px;
        }

        .table__cell--center {
          text-align: center;
        }

        .table__cell--icon {
          width: 80px;
        }

        .table__cell--id {
          width: 50px;
        }

        .table__cell--sort {
          cursor: pointer;
          white-space: nowrap;
        }

        .table__cell--sort:before {
          content: url(images/svgs/triangles.svg);
          margin-left: -7px;
        }

        .table__cell-list {
          list-style: none;
        }

        .table__image {
          background-color: #fff;
          border: 1px solid #dadada;
          height: 50px;
          padding: 4px;
          width: 50px;
        }
      </style>
    </template>
  </dom-module>
`;

document.head.appendChild(documentContainer.content);
