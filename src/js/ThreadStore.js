/** @jsx React.DOM */

var API = require('./API.js');
var ActionType = require('./ActionType.js');
var BaseStore = require('./BaseStore.js');
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
        shouldEmitChange = true;
        break;

      case ActionType.Thread.ARCHIVE_STARTED:
        _.each(this._pagingInfoByQuery, (pagingInfo, query) => {
          if (/in\:\s*inbox/.test(query)) {
            var newFetchedResults = pagingInfo.fetchedResults.filter(
              thread => thread.id !== action.threadID
            );

            if (newFetchedResults.length < pagingInfo.fetchedResults.length) {
              pagingInfo.fetchedResults = newFetchedResults;
              shouldEmitChange = true;
            }
          }
        });
        break;
    }

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

    return API.listThreads(apiOptions).then(result => {
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
