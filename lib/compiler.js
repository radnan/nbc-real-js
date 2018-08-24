export function compiler(component) {
  compile.component = component;
  return compile;

  function compile({tag, attrs, children}) {
    let node = document.createElement(tag);

    attachProps(node, attrs, component);
    attachAttributes(node, attrs, component);

    for (let child of children) {
      attachChildNode(node, child, compile);
    }

    return node;
  }
}

function attachProps(node, attrs, component) {
  setProps(node, attrs, true);

  component.onPropsUpdate(() => {
    setProps(node, attrs, false);
  });
}

function setProps(node, attrs, includeEvents = false) {
  Object.keys(attrs).forEach((name) => {
    if (!name.startsWith('props-')) {
      return;
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
  });
}

function attachAttributes(node, attrs, component) {
  setAttributes(node, attrs, true);

  component.onPropsUpdate(() => {
    setAttributes(node, attrs, false);
  });
}

function setAttributes(node, attrs, includeEvents = false) {
  Object.keys(attrs).forEach((name) => {
    if (name.startsWith('props-')) {
      return;
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
  });
}

function attachChildNode(node, child, compile) {
  let childNodes = resolveNodes(child, compile);
  appendNodes(node, childNodes);

  if (typeof child === 'function') {
    compile.component.onRenderUpdate(() => {
      let newNodes = resolveNodes(child, compile);

      if (hasNodesChanged(childNodes, newNodes)) {
        replaceNodes(node, childNodes, newNodes);
        childNodes = newNodes;
      }
    });
  }
}

function resolveNodes(node, compile) {
  if (typeof node === 'function') {
    node = node();
  }

  return (Array.isArray(node) ? node : [node]).map((node) => {
    if (typeof node === 'object') {
      node = compile(node);
    } else if (typeof node === 'string') {
      node = document.createTextNode(node);
    }

    return node;
  });
}

function appendNodes(node, childNodes) {
  for (let childNode of childNodes) {
    node.appendChild(childNode);
  }
}

function hasNodesChanged(oldNodes, newNodes) {
  let oldTemplate = oldNodes.map(n => n.outerHTML).join('\n');
  let newTemplate = newNodes.map(n => n.outerHTML).join('\n');

  return newTemplate !== oldTemplate;
}

function replaceNodes(node, childNodes, newNodes) {
  for (let newNode of newNodes) {
    childNodes[0].insertAdjacentElement('beforebegin', newNode);
  }
  for (let childNode of childNodes) {
    node.removeChild(childNode);
  }
}
