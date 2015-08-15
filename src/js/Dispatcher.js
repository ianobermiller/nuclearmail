/** @flow */

import store from './store';
import {EventEmitter} from 'events';

const EVENT = 'dispatch';
const emitter = new EventEmitter();

const Dispatcher = {
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
