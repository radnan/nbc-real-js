import {compiler} from './compiler.js';
import {Props} from './props.js';

export class RJElement extends HTMLElement {
  constructor() {
    super();

    this.compiler = compiler(this);
    this.props = {};
  }

  connectedCallback() {
    this.attachShadow({mode: 'open'});
    this.shadowRoot.innerHTML = this.getStyle();
    this.shadowRoot.appendChild(this.compiler(this.render()));

    this.attachProps();
  }

  attachProps() {
    let props = new Props(this.props);
    props.attach({
      update: () => {
        this.dispatchEvent(new Event('rjPropsChange'));
        this.dispatchEvent(new Event('rjRenderChange'));
      }
    });
    this.props = props.proxy;
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
