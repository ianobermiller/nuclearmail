/** @flow */

class Cache {
  namespace: string;

  constructor(namespace: string) {
    this.namespace = namespace;
  }

  get(key: string): any {
    var value = localStorage.getItem(this.namespace + '/' + key);
    return value && JSON.parse(value);
  }

  set(key: string, value: any): boolean {
    try {
      localStorage.setItem(this.namespace + '/' + key, JSON.stringify(value));
    } catch(e) {
      return false;
    }
  }
}

module.exports = Cache;
