/** @flow */

var ActionType = require('./ActionType.js');
var BaseStore = require('./BaseStore.js');
var Thread = require('./Thread.js');
var ThreadAPI = require('./ThreadAPI.js');
var _ = require('lodash');

type ListResult = {
  hasMore: bool;
  resultSizeEstimate: number;
  items: Array<Thread>;
};

type PagingInfo = {
  fetchedResults: Array<Thread>;
  fetchedResultCount: number;
  nextPageToken: string;
  resultSizeEstimate: number;
};

class ThreadStore extends BaseStore {
  _pagingInfoByQuery: {[query: string]: PagingInfo};
  _threadsByID: {[id: string]: Thread};

  constructor() {
    super();

    this._pagingInfoByQuery = {};
    this._threadsByID = {};
  }

  handleDispatch(action: {type: string; threadID?: string;}): void {
    var shouldEmitChange = false;
    switch (action.type) {
      case ActionType.Thread.REFRESH:
        this._pagingInfoByQuery = {};
        this.emitChange();
        break;

      case ActionType.Thread.ARCHIVE_STARTED:
        if (!action.threadID) throw new Error('threadID null');
        this._removeThreadFromCache(action.threadID, /in\:\s*inbox/);
        break;

      case ActionType.Thread.MOVE_TO_INBOX_STARTED:
        this._invalidateCache(/in\:\s*inbox/);
        break;

      case ActionType.Thread.UNSTAR_STARTED:
        if (!action.threadID) throw new Error('threadID null');
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

  list(options: {query: string; maxResultCount: number;}): ?ListResult {
    var query = options.query || '';
    var requestedResultCount = options.maxResultCount || 10;
    var pageToken = null;
    var maxResults = requestedResultCount;
    var result = null;

    var pagingInfo = this._pagingInfoByQuery[query];
    if (pagingInfo) {
      maxResults = requestedResultCount - pagingInfo.fetchedResultCount;
      pageToken = pagingInfo.nextPageToken;

      result = {
        hasMore: !!pageToken,
        resultSizeEstimate: pagingInfo.resultSizeEstimate,
        items: pagingInfo.fetchedResults.slice(0, requestedResultCount),
      };

      if (maxResults <= 0) {
        return result;
      }
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

    return result;
  }
}

module.exports = new ThreadStore();
