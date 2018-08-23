export function html(tag, attrs = {}, children = []) {
  children = Array.isArray(children) ? children : [children];

  return { tag, attrs, children };
}
