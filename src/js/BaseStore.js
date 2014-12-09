/** @flow */

var Dispatcher = require('./Dispatcher.js');
var EventEmitter = require('events').EventEmitter;

var CHANGE_EVENT = 'change';

class BaseStore {
  handleDispatch: (action: Object) => void;

  constructor() {
    autobind(this);
    this._emitter = new EventEmitter();
    this.handleDispatch && Dispatcher.subscribe(this.handleDispatch);
  }

  emitChange(data: Object) {
    this._emitter.emit(CHANGE_EVENT, Object.assign({store: this}, data));
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

function autobind(object: {[functionName: string]: any;}) {
  for (var prop in object) {
    if (typeof object[prop] === 'function' && /^[A-Za-z]/.test(prop)) {
      object[prop] = object[prop].bind(object);
      object[prop].store = object;
    }
  }
}

module.exports = BaseStore;
