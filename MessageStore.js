/** @jsx React.DOM */

var API = require('./API.js');
var Dispatcher = require('./Dispatcher.js');
var EventEmitter = require('events').EventEmitter;
var asap = require('asap');

var CHANGE = 'change';

class MessageStore {
  constructor() {
    this._emitter = new EventEmitter();
    this._cache = {};

    Dispatcher.subscribe(this._handleDispatch.bind(this));
    for (var prop in this) {
      if (typeof this[prop] === 'function' && /^[A-Za-z]/.test(prop)) {
        this[prop] = this[prop].bind(this);
      }
    }
  }

  _handleDispatch(actionType, data) {
  }

  getMessages(options) {
    return this._wrapAPICall('API.getMessages', API.getMessages, options);
  }

  _wrapAPICall(apiName, apiFunction, options) {
    var emitter = this._emitter;
    var cacheKey = apiName + (options ? '-' + JSON.stringify(options) : '');

    var listener = {
      subscribe(fn) {
        emitter.addListener(CHANGE, fn);
        return {
          remove() {
            emitter.removeListener(CHANGE, fn);
          }
        };
      },
    };

    // In case the API call was synchronous, postpone until after the caller
    // has subscribed.
    var resolve = result => {
      asap(() => emitter.emit(CHANGE, {isLoading: false, value: result}));
    };

    if (this._cache.hasOwnProperty(cacheKey)) {
      resolve(this._cache[cacheKey]);
    } else {
      emitter.emit(CHANGE, {isLoading: true});
      apiFunction(options).then(result => {
        this._cache[cacheKey] = result;
        resolve(result);
      });
    }

    return listener;
  }
}

// Test updating and rendering
//setInterval(() => module.exports.getMessages(), 1000);

module.exports = new MessageStore();
