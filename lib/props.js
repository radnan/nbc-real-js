export class Props {
  constructor(target = {}) {
    this.observers = [];
    this.proxy = new Proxy(target, {
      set: (obj, name, value) => {
        let oldValue = obj[name];
        obj[name] = value;

        if (value !== oldValue) {
          this.notifyObservers();
        }

        return true;
      }
    });
  }

  attach(observer) {
    this.observers.push(observer);
  }

  notifyObservers() {
    this.timeout && clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      for (let observer of this.observers) {
        observer.update();
      }
    }, 1);
  }
}
