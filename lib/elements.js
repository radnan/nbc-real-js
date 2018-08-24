import {Compiler} from './compiler.js';
import {Props} from './props.js';

export class RJElement extends HTMLElement {
  constructor() {
    super();

    this.compiler = new Compiler();
    this.props = {};
  }

  connectedCallback() {
    this.attachShadow({mode: 'open'});
    this.shadowRoot.innerHTML = this.getStyle();
    this.shadowRoot.appendChild(this.compiler.compile(this.render()));

    this.attachProps();
  }

  attachProps() {
    let props = new Props(this.props);
    props.attach({
      update: () => {
        this.compiler.compile(this.render());
      }
    });
    this.props = props.proxy;
  }

  getStyle() {
    return '';
  }
}
