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
      }
    }

    this.handleDispatch && Dispatcher.subscribe(this.handleDispatch);
  }

  emitChange() {
    this._emitter.emit(CHANGE_EVENT);
  }
}

module.exports = BaseStore;
