/** @flow */

var Dispatcher = require('./Dispatcher.js');
var EventEmitter = require('events').EventEmitter;
var asap = require('asap');
var isOffline = require('./isOffline');

var CHANGE_EVENT = 'change';

class BaseStore {
  handleDispatch: (action: Object) => void;

  constructor() {
    autobind(this);
    this._emitter = new EventEmitter();
    this.handleDispatch && Dispatcher.subscribe(this.handleDispatch);
  }

  emitChange(data: Object = {}) {
    this._emitter.emit(CHANGE_EVENT, {store: this, ...data});
  }

  loadCachedData() {
    if (!isOffline()) {
      return;
    }

    Object.keys(this).forEach(key => {
      var value = localStorage.getItem(this.constructor.name + '.' + key);
      if (value) {
        console.log('loaded', this.constructor.name + '.' + key, JSON.parse(value));
        this[key] = JSON.parse(value);
      }
    });
  }

  subscribe(
    fn: (data: any) => void
  ): {remove: () => void;} {
    this._emitter.on(CHANGE_EVENT, fn);

    return {
      remove: () => {
        this._emitter.removeListener(CHANGE_EVENT, fn);
      }
    };
  }
}

function autobind(instance: Object) {
  Object.getOwnPropertyNames(Object.getPrototypeOf(instance)).forEach(prop => {
    if (
      typeof instance[prop] === 'function' &&
      /^[A-Za-z]/.test(prop) &&
      prop !== 'constructor'
    ) {
      instance[prop] = instance[prop].bind(instance);
      instance[prop].store = instance;
    }
  });
}

module.exports = BaseStore;
