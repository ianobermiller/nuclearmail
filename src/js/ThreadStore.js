/** @jsx React.DOM */

var ActionType = require('./ActionType.js');
var BaseStore = require('./BaseStore.js');
var ThreadAPI = require('./ThreadAPI.js');
var _ = require('lodash');

class ThreadStore extends BaseStore {
  constructor() {
    super();

    this._pagingInfoByQuery = {};
  }

  handleDispatch(action) {
    var shouldEmitChange = false;
    switch (action.type) {
      case ActionType.Thread.REFRESH:
        this._pagingInfoByQuery = {};
        this.emitChange();
        break;

      case ActionType.Thread.ARCHIVE_STARTED:
        this._invalidateCache(action.threadID, /in\:\s*inbox/);
        break;

      case ActionType.Thread.UNSTAR_STARTED:
        this._invalidateCache(action.threadID, /is\:\s*starred/);
        break;
    }

    shouldEmitChange && this.emitChange();
  }

  _invalidateCache(threadID, queryRegex) {
    var shouldEmitChange = false;

    _.each(this._pagingInfoByQuery, (pagingInfo, query) => {
      if (queryRegex.test(query)) {
        var newFetchedResults = pagingInfo.fetchedResults.filter(
          thread => thread.id !== threadID
        );

        if (newFetchedResults.length < pagingInfo.fetchedResults.length) {
          pagingInfo.fetchedResults = newFetchedResults;
          shouldEmitChange = true;
        }
      }
    });

    shouldEmitChange && this.emitChange();
  }

  list(options) {
    var query = options.query || '';
    var requestedResultCount = options.maxResultCount || 10;
    var pageToken = null;
    var maxResults = requestedResultCount;

    var pagingInfo = this._pagingInfoByQuery[query];
    if (pagingInfo) {
      maxResults = requestedResultCount - pagingInfo.fetchedResultCount;
      pageToken = pagingInfo.nextPageToken;

      if (maxResults <= 0) {
        return Promise.resolve({
          hasMore: !!pageToken,
          resultSizeEstimate: pagingInfo.resultSizeEstimate,
          items: pagingInfo.fetchedResults.slice(0, requestedResultCount),
        })
      }
    }


    var apiOptions = {
      query,
      maxResults,
      pageToken,
    };

    return ThreadAPI.list(apiOptions).then(result => {
      var previousResults = pageToken ? pagingInfo.fetchedResults : [];

      var newPagingInfo = this._pagingInfoByQuery[query] = {};
      newPagingInfo.fetchedResults = previousResults.concat(result.items);
      newPagingInfo.fetchedResultCount = newPagingInfo.fetchedResults.length;
      newPagingInfo.nextPageToken = result.nextPageToken;
      newPagingInfo.resultSizeEstimate = result.resultSizeEstimate;

      return {
        hasMore: !!result.nextPageToken,
        resultSizeEstimate: result.resultSizeEstimate,
        items: newPagingInfo.fetchedResults,
      };
    });
  }
}

module.exports = new ThreadStore();
