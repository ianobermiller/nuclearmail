/** @jsx React.DOM */

var API = require('./API.js');
var Dispatcher = require('./Dispatcher.js');
var EventEmitter = require('events').EventEmitter;

var CHANGE_EVENT = 'change';

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
    return API.getMessages(options);
    // return this._cacheApiCall('API.getMessages', API.getMessages, options);
  }

  _cacheApiCall(apiName, apiFunction, options) {
    var emitter = this._emitter;
    var cacheKey = apiName + (options ? '-' + JSON.stringify(options) : '');

    if (this._cache.hasOwnProperty(cacheKey)) {
      return Promise.resolve(this._cache[cacheKey]);
    }

    return apiFunction(options).then(result => {
      emitter.emit(CHANGE_EVENT);
      this._cache[cacheKey] = result;
    });
  }
}

// Test updating and rendering
//setInterval(() => module.exports.getMessages(), 1000);

module.exports = new MessageStore();
