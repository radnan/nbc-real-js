export function html(tag, attrs = {}, children = []) {
  children = Array.isArray(children) ? children : [children];

  return (component) => {
    let node = document.createElement(tag);

    attachAttributes(node, attrs, component);

    for (let child of children) {
      attachChildNode(node, child, component);
    }

    return node;
  };
}

function attachAttributes(node, attrs, component) {
  setProps(node, attrs, true);
  setAttributes(node, attrs, true);

  component.addEventListener('rjStateChange', () => {
    setProps(node, attrs, false);
    setAttributes(node, attrs, false);
  });
}

function setProps(node, attrs, includeEvents = false) {
  for (let name in attrs) {
    if (!attrs.hasOwnProperty(name) || !name.startsWith('props-')) {
      continue;
    }

    if (name.startsWith('props-on-')) {
      if (includeEvents) {
        node.props[name.slice(9)] = function () {
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

  if (childNode.nodeType === 3) {
    component.addEventListener('rjStateChange', () => {
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
    node = compiler(component);
  }

  if (typeof node === 'string') {
    node = document.createTextNode(node);
  }

  return node;
}
