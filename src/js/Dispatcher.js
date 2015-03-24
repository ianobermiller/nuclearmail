/** @flow */

var EventEmitter = require('events').EventEmitter;

var EVENT = 'dispatch';
var emitter = new EventEmitter();

var Dispatcher = {
  dispatch(event: any) {
    emitter.emit(EVENT, event);
  },

  subscribe(fn: (data: any) => void): {remove: () => void;} {
    emitter.on(EVENT, fn);
    return {
      remove() {
        emitter.removeListener(EVENT, fn);
      }
    };
  }
};

module.exports = Dispatcher;
