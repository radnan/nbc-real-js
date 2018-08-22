import {props} from './props.js';

export class RJElement extends HTMLElement {
  constructor() {
    super();

    this.props = props(this);
  }

  connectedCallback() {
    this.attachShadow({mode: 'open'});
    this.shadowRoot.innerHTML = this.getStyle();
    this.shadowRoot.appendChild(this.render());
  }

  getStyle() {
    return '';
  }
}
