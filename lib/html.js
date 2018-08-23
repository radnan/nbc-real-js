export function html(tag, attrs = {}, children = []) {
  children = Array.isArray(children) ? children : [children];

  compiler._isCompiler = true;
  return compiler;

  function compiler(component) {
    let node = document.createElement(tag);

    attachPropsAndAttributes(node, attrs, component);

    children = compileNodes(children, component);
    for (let child of children) {
      attachChildNode(node, child, component);
    }

    return node;
  }
}

function attachPropsAndAttributes(node, attrs, component) {
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

function compileNodes(nodes, component) {
  return nodes.map((node) => typeof node === 'function' && '_isCompiler' in node ? node(component) : node);
}

function attachChildNode(node, child, component) {
  let childNodes = resolveNodes(child, component);
  for (let childNode of childNodes) {
    node.appendChild(childNode);
  }

  if (typeof child === 'function') {
    component.addEventListener('rjStateChangeChildren', () => {
      let newNodes = resolveNodes(child, component);

      if (hasNodesChanged(childNodes, newNodes)) {
        replaceNodes(node, childNodes, newNodes);
        childNodes = newNodes;
      }
    });
  }
}

function resolveNodes(compiler, component) {
  let node = compiler;

  if (typeof compiler === 'function') {
    node = compiler();
  }

  let nodes = Array.isArray(node) ? node : [node];

  for (let i = 0; i < nodes.length; i++) {
    if (typeof nodes[i] === 'function') {
      nodes[i] = nodes[i](component);
    }

    if (typeof nodes[i] === 'string') {
      nodes[i] = document.createTextNode(nodes[i]);
    }
  }

  return nodes;
}

function hasNodesChanged(oldNodes, newNodes) {
  let oldTemplate = oldNodes.map(n => n.outerHTML).join('\n');
  let newTemplate = newNodes.map(n => n.outerHTML).join('\n');

  return newTemplate !== oldTemplate;
}

function replaceNodes(node, childNodes, newNodes) {
  for (let newNode of newNodes) {
    childNodes[0].insertAdjacentElement('afterend', newNode);
  }
  for (let childNode of childNodes) {
    node.removeChild(childNode);
  }
}
