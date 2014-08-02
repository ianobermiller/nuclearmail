/** @jsx React.DOM */

var EventEmitter = require('events').EventEmitter;

var EVENT = 'dispatch';
var emitter = new EventEmitter();

var Dispatcher = {
  dispatch(event) {
    emitter.emit(EVENT, event);
  },

  subscribe(fn) {
    var handler
    emitter.on(EVENT, fn);
    return {
      remove() {
        emitter.removeListern(EVENT, fn);
      }
    };
  }
};

module.exports = Dispatcher;
