const APPEND_CHILD = 'append-child';
const COMPILE_CHILD = 'compile-child';

const CREATE_NODE = 'create-node';
const CREATE_TEXT_NODE = 'create-text-node';
const REPLACE_TEXT_NODE = 'replace-text-node';

const SET_ATTR = 'set-attr';

const REPLACE_EVENT = 'replace-event';
const SET_EVENT = 'set-event';

const SET_PROP = 'set-prop';
const REMOVE_PROP = 'remove-prop';

export class Compiler {
  constructor() {
    this.compilers = {};
  }

  compile(newVNode) {
    let oldVNode = this.vNode;
    this.vNode = newVNode;

    let changes = diff(oldVNode, newVNode);
    changes.forEach((change) => {
      switch (change.type) {
        case CREATE_NODE:
          this.node = document.createElement(change.data);
          break;

        case CREATE_TEXT_NODE:
          this.node = document.createTextNode(change.data);
          break;
        case REPLACE_TEXT_NODE:
          this.node.textContent = change.data;
          break;

        case SET_ATTR:
          this.node.setAttribute(change.data.name, change.data.value);
          break;

        case REPLACE_EVENT:
          this.node.removeEventListener(change.data.name.slice(3), change.data.oldValue);
        case SET_EVENT:
          this.node.addEventListener(change.data.name.slice(3), change.data.value);
          break;

        case SET_PROP:
          this.node.props[change.data.name.slice(6)] = change.data.value;
          break;

        case APPEND_CHILD:
          this.node.appendChild(this.getCompiler(change.data.name).compile(change.data.value));
          break;
        case COMPILE_CHILD:
          this.getCompiler(change.data.name).compile(change.data.value);
          break;
      }
    });

    return this.node;
  }

  getCompiler(name) {
    if (!(name in this.compilers)) {
      this.compilers[name] = new Compiler();
    }

    return this.compilers[name];
  }
}

function diff(oldVNode, newVNode) {
  if (typeof newVNode === 'string') {
    if (!oldVNode) {
      return [{
        type: CREATE_TEXT_NODE,
        data: newVNode,
      }];
    } else if (oldVNode !== newVNode) {
      return [{
        type: REPLACE_TEXT_NODE,
        data: newVNode,
      }];
    }

    return [];
  }

  let changes = [];

  if (!oldVNode || newVNode.name !== oldVNode.name) {
    changes.push({
      type: CREATE_NODE,
      data: newVNode.name,
    });
  }

  changes = changes.concat(getProps(newVNode).map(({name, value}) => {
    if (!oldVNode || !oldVNode.attrs[name] || oldVNode.attrs[name] !== value) {
      return {
        type: SET_PROP,
        data: {name, value},
      };
    }

    return false;
  }).filter(v => v));

  changes = changes.concat(oldVNode ? getProps(oldVNode).map(({name}) => {
    if (!newVNode.attrs[name]) {
      return {
        type: REMOVE_PROP,
        data: name,
      };
    }

    return false;
  }).filter(v => v) : []);

  changes = changes.concat(getAttrs(newVNode).map(({name, value}) => {
    if (!oldVNode || !oldVNode.attrs[name] || oldVNode.attrs[name] !== value) {
      return {
        type: SET_ATTR,
        data: {name, value},
      };
    }

    return false;
  }).filter(v => v));

  changes = changes.concat(getEvents(newVNode).map(({name, value}) => {
    if (!oldVNode || !oldVNode.attrs[name]) {
      return {
        type: SET_EVENT,
        data: {name, value},
      };
    }

    return {
      type: REPLACE_EVENT,
      data: {name, value, oldValue: oldVNode.attrs[name]},
    };
  }));

  changes = changes.concat(getChildren(newVNode).map(({name, value}) => {
    if (!oldVNode || !oldVNode.children[name]) {
      return {
        type: APPEND_CHILD,
        data: {name, value},
      };
    }

    return {
      type: COMPILE_CHILD,
      data: {name, value},
    };
  }));

  return changes;
}

function getProps(vNode) {
  return Object.keys(vNode.attrs).map((name) => {
    if (!name.startsWith('props-')) {
      return false;
    }

    return {name, value: vNode.attrs[name]};
  }).filter(v => v);
}

function getAttrs(vNode) {
  return Object.keys(vNode.attrs).map((name) => {
    if (name.startsWith('props-') || name.startsWith('on-')) {
      return false;
    }

    return {name, value: vNode.attrs[name]};
  }).filter(v => v);
}

function getEvents(vNode) {
  return Object.keys(vNode.attrs).map((name) => {
    if (!name.startsWith('on-')) {
      return false;
    }

    return {name, value: vNode.attrs[name]};
  }).filter(v => v);
}

function getChildren(vNode) {
  return vNode.children.map((childVNode, i) => {
    return {name: i, value: childVNode};
  });
}
