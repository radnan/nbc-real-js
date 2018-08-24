export function h(name, attrs = {}, children = []) {
  children = Array.isArray(children) ? children : [children];

  return { name, attrs, children };
}
