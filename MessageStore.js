/** @jsx React.DOM */

var API = require('./API.js');
var Dispatcher = require('./Dispatcher.js');
var EventEmitter = require('events').EventEmitter;

var CHANGE_EVENT = 'change';

class MessageStore {
  constructor() {
    this._emitter = new EventEmitter();
    this._cache = {};
    this._pagingInfoByQuery = {};

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
    var query = options.query || '';
    var requestedResultCount = options.maxResultCount || 10;
    var pagingInfo = this._pagingInfoByQuery[query];
    var fetchedResultCount = pagingInfo ? pagingInfo.fetchedResults.length : 0;
    var pageToken = fetchedResultCount < requestedResultCount && pagingInfo ?
      pagingInfo.nextPageToken :
      null;

    var apiOptions = {
      query: query,
      maxResults: pageToken ?
        requestedResultCount - fetchedResultCount :
        requestedResultCount,
      pageToken: pageToken,
    };

    return API.getMessages(apiOptions).then(result => {
      var previousResults = pageToken ? pagingInfo.fetchedResults : [];
      var newPagingInfo = this._pagingInfoByQuery[query] = {};
      newPagingInfo.fetchedResults = previousResults.concat(result.items);
      newPagingInfo.nextPageToken = result.nextPageToken;
      return {
        hasMore: !!result.nextPageToken,
        resultSizeEstimate: result.resultSizeEstimate,
        items: newPagingInfo.fetchedResults,
      };
    });
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
