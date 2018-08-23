import {compiler} from './compiler.js';
import {props} from './props.js';

export class RJElement extends HTMLElement {
  constructor() {
    super();

    this.compiler = compiler(this);
    this.props = props(this);
  }

  connectedCallback() {
    this.attachShadow({mode: 'open'});
    this.shadowRoot.innerHTML = this.getStyle();
    this.shadowRoot.appendChild(this.compiler(this.render()));
  }

  propsChanged() {
    this.dispatchEvent(new Event('rjPropsChange'));
    this.dispatchEvent(new Event('rjRenderChange'));
  }

  onPropsUpdate(callback) {
    this.addEventListener('rjPropsChange', callback);
  }

  onRenderUpdate(callback) {
    this.addEventListener('rjRenderChange', callback);
  }

  getStyle() {
    return '';
  }
}
