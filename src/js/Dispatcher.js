/** @flow */

import store from './store';
import {EventEmitter} from 'events';

var EVENT = 'dispatch';
var emitter = new EventEmitter();

var Dispatcher = {
  dispatch(action: any) {
    store.dispatch(action); // shim until redux migration complete
    emitter.emit(EVENT, action);
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
