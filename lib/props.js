export function props(component) {
  return new Proxy({}, {
    set(obj, name, value) {
      let oldValue = obj[name];
      obj[name] = value;

      if (value !== oldValue) {
        component.dispatchEvent(new Event('rjStateChange'));
      }

      return true;
    }
  });
}
