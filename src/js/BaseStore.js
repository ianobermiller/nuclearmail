/** @flow */

var Dispatcher = require('./Dispatcher');
var EventEmitter = require('events').EventEmitter;
var {Observable} = require('rx');
var asap = require('asap');
var Rx = require('rx');
var isOffline = require('./isOffline');

var CHANGE_EVENT = 'change';

class BaseStore {
  // Can't declare here, because Babel will treat it as a definition and make it
  // null. So cast to any below for flow.
  // handleDispatch: (action: Object) => void;

  constructor() {
    autobind(this);
    this._emitter = new EventEmitter();
    if ((this: any).handleDispatch) {
      Dispatcher.subscribe((this: any).handleDispatch);
    }
  }

  emitChange(data: Object = {}) {
    this._emitter.emit(CHANGE_EVENT, {store: this, ...data});
  }

  __wrapAsObservable<TOptions, TResult>(
    fn: (options: TOptions) => TResult,
    options: TOptions
  ): Observable<TResult> {
    return Rx.Observable.create(observer => {
      observer.onNext(fn(options));
      var subscription = this.subscribe(() => observer.onNext(fn(options)));
      return () => subscription.remove();
    }).distinctUntilChanged(
      /*keySelector*/ null,
      (a, b) => a === b,
    );
  }

  loadCachedData() {
    loadCachedData(this);
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

function loadCachedData(instance: Object) {
  if (!isOffline()) {
    return;
  }

  Object.keys(instance).forEach(key => {
    var ctor: any = instance.constructor;
    var value = localStorage.getItem(ctor.name + '.' + key);
    if (value) {
      instance[key] = JSON.parse(value);
    }
  });
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
