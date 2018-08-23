export function html(tag, attrs = {}, children = []) {
  children = Array.isArray(children) ? children : [children];

  compiler._isCompiler = true;
  return compiler;

  function compiler(component) {
    let node = document.createElement(tag);

    attachAttributes(node, attrs, component);

    children = children.map((child) => {
      if (typeof child === 'function' && '_isCompiler' in child) {
        return child(component);
      }

      return child;
    });

    for (let child of children) {
      attachChildNode(node, child, component);
    }

    return node;
  }
}

function attachAttributes(node, attrs, component) {
  setProps(node, attrs, true);
  setAttributes(node, attrs, true);

  component.addEventListener('rjStateChangeProps', () => {
    setProps(node, attrs, false);
    setAttributes(node, attrs, false);
  });
}

function setProps(node, attrs, includeEvents = false) {
  for (let name in attrs) {
    if (!attrs.hasOwnProperty(name) || !name.startsWith('props-')) {
      continue;
    }

    if (name.startsWith('props-on')) {
      if (includeEvents) {
        node.props[name.slice(6)] = function () {
          return attrs[name].apply(node, arguments);
        };
      }
    } else {
      let value = attrs[name];
      value = typeof value === 'function' ? value() : value;

      node.props[name.slice(6)] = value;
    }
  }
}

function setAttributes(node, attrs, includeEvents = false) {
  for (let name in attrs) {
    if (!attrs.hasOwnProperty(name) || name.startsWith('props-')) {
      continue;
    }

    if (name.startsWith('on-')) {
      if (includeEvents) {
        node.addEventListener(name.slice(3), attrs[name]);
      }
    } else {
      let value = attrs[name];
      value = typeof value === 'function' ? value() : value;

      node.setAttribute(name, value);
    }
  }
}

function attachChildNode(node, child, component) {
  let childNode = compileNode(child, component);
  node.appendChild(childNode);

  if (typeof child === 'function') {
    component.addEventListener('rjStateChangeChildren', () => {
      let newNode = compileNode(child, component);
      if (newNode.textContent !== childNode.textContent) {
        childNode.textContent = newNode.textContent;
      }
    });
  }
}

function compileNode(compiler, component) {
  let node = compiler;

  if (typeof compiler === 'function') {
    node = compiler();
  }

  if (typeof node === 'string') {
    node = document.createTextNode(node);
  }

  return node;
}
