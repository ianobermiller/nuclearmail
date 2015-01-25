/** @flow */

var ActionType = require('./ActionType.js');
var BaseStore = require('./BaseStore.js');
var ThreadAPI = require('./ThreadAPI.js');
var _ = require('lodash');

declare class ListResult {
  hasMore: boolean;
  resultSizeEstimate: number;
  items: Array<Object>;
}

class ThreadStore extends BaseStore {
  _pagingInfoByQuery: {[query: string]: Object};
  _threadsByID: {[id: string]: Object};

  constructor() {
    super();

    this._pagingInfoByQuery = {};
    this._threadsByID = {};
  }

  handleDispatch(action: Object) {
    var shouldEmitChange = false;
    switch (action.type) {
      case ActionType.Thread.REFRESH:
        this._pagingInfoByQuery = {};
        this.emitChange();
        break;

      case ActionType.Thread.ARCHIVE_STARTED:
        this._removeThreadFromCache(action.threadID, /in\:\s*inbox/);
        break;

      case ActionType.Thread.MOVE_TO_INBOX_STARTED:
        this._invalidateCache(/in\:\s*inbox/);
        break;

      case ActionType.Thread.UNSTAR_STARTED:
        this._removeThreadFromCache(action.threadID, /is\:\s*starred/);
        break;
    }

    shouldEmitChange && this.emitChange();
  }

  _invalidateCache(queryRegex: RegExp) {
    var shouldEmitChange = false;

    _.each(this._pagingInfoByQuery, (pagingInfo, query) => {
      if (queryRegex.test(query)) {
        delete this._pagingInfoByQuery[query];
        shouldEmitChange = true;
      }
    });

    shouldEmitChange && this.emitChange();
  }

  _removeThreadFromCache(threadID: string, queryRegex: RegExp) {
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

  getByID(
    options: {id: string}
  ): ?Object {
    if (this._threadsByID[options.id]) {
      return this._threadsByID[options.id];
    }

    ThreadAPI.getByID(options).then(item => {
      this._threadsByID[item.id] = item;
      this.emitChange();
    });

    return null;
  }

  list(options: Object): ?ListResult {
    var query = options.query || '';
    var requestedResultCount = options.maxResultCount || 10;
    var pageToken = null;
    var maxResults = requestedResultCount;

    var pagingInfo = this._pagingInfoByQuery[query];
    if (pagingInfo) {
      maxResults = requestedResultCount - pagingInfo.fetchedResultCount;
      pageToken = pagingInfo.nextPageToken;

      return {
        hasMore: !!pageToken,
        resultSizeEstimate: pagingInfo.resultSizeEstimate,
        items: pagingInfo.fetchedResults.slice(0, requestedResultCount),
      };
    }

    var apiOptions = {
      query,
      maxResults,
      pageToken,
    };

    ThreadAPI.list(apiOptions).then(result => {
      // Add to byID cache
      result.items.forEach(item => this._threadsByID[item.id] = item);

      // Update cache with concatenated results
      var previousResults = pageToken ? pagingInfo.fetchedResults : [];
      var allItems = previousResults.concat(result.items);
      this._pagingInfoByQuery[query] = {
        fetchedResults: allItems,
        fetchedResultCount: allItems.length,
        nextPageToken: result.nextPageToken,
        resultSizeEstimate: result.resultSizeEstimate,
      };

      this.emitChange();
    });

    return null;
  }
}

module.exports = new ThreadStore();
