/** @flow */

var ActionType = require('./ActionType');
var BaseStore = require('./BaseStore');
var ThreadAPI = require('./ThreadAPI');
var _ = require('lodash');
var {Observable} = require('rx');

import type {TThread} from './Types';
type Thread = typeof TThread;

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

    this.loadCachedData();
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

  getByID(options: {id: string}): Observable<?Thread> {
    return this.__wrapAsObservable(this._getByIDSync, options);
  }

  _getByIDSync = (options: {id: string}) => {
    if (this._threadsByID.hasOwnProperty(options.id)) {
      return this._threadsByID[options.id];
    }

    // Prevent double fetching
    this._threadsByID[options.id] = null;

    ThreadAPI.getByID(options).then(item => {
      this._threadsByID[item.id] = item;
      this.emitChange();
    });

    return null;
  };

  list(
    options: {query: string; maxResultCount: number}
  ): Observable<?ListResult> {
    return this.__wrapAsObservable(this._listSync, options);
  }

  _listSync = (options: {query: string; maxResultCount: number;}) => {
    var query = options.query || '';
    var requestedResultCount = options.maxResultCount || 10;
    var pageToken = null;
    var maxResults = requestedResultCount;
    var result = null;

    if (this._pagingInfoByQuery.hasOwnProperty(query)) {
      var pagingInfo = this._pagingInfoByQuery[query];
      if (!pagingInfo) {
        return null;
      }

      maxResults = requestedResultCount - pagingInfo.fetchedResultCount;
      pageToken = pagingInfo.nextPageToken;

      result = {
        hasMore: !!pageToken,
        resultSizeEstimate: pagingInfo.resultSizeEstimate,
        items: pagingInfo.fetchedResults.slice(0, requestedResultCount),
      };

      if (maxResults <= 0 || !result.hasMore || pagingInfo.isFetching) {
        return result;
      }
    }

    var apiOptions = {
      query,
      maxResults,
      pageToken,
    };

    // Prevent double fetching
    if (!this._pagingInfoByQuery[query]) {
      this._pagingInfoByQuery[query] = null;
    } else {
      this._pagingInfoByQuery[query].isFetching = true;
    }

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
  };
}

module.exports = new ThreadStore();
