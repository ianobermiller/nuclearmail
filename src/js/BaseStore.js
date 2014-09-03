/** @jsx React.DOM */

var Dispatcher = require('./Dispatcher.js');
var EventEmitter = require('events').EventEmitter;

var CHANGE_EVENT = 'change';

class BaseStore {
  constructor() {
    this._emitter = new EventEmitter();

    // Autobind methods
    for (var prop in this) {
      if (typeof this[prop] === 'function' && /^[A-Za-z]/.test(prop)) {
        this[prop] = this[prop].bind(this);
        this[prop].store = this;
      }
    }

    this.handleDispatch && Dispatcher.subscribe(this.handleDispatch);
  }

  emitChange(data) {
    this._emitter.emit(CHANGE_EVENT, Object.assign({store: this}, data));
  }

  subscribe(fn) {
    this._emitter.on(CHANGE_EVENT, fn);

    return {
      remove() {
        this._emitter.removeListener(CHANGE_EVENT, fn);
      }
    };
  }
}

module.exports = BaseStore;
