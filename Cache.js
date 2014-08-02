/** @jsx React.DOM */

class Cache {
  constructor(namespace) {
    this.namespace = namespace;
  }

  get(key) {
    var value = localStorage[this.namespace + '/' + key];
    return value && JSON.parse(value);
  }

  set(key, value) {
    localStorage[this.namespace + '/' + key] = JSON.stringify(value);
  }
}

module.exports = Cache;
