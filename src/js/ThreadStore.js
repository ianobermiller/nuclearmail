/** @jsx React.DOM */

var API = require('./API.js');
var BaseStore = require('./BaseStore.js');

class ThreadStore extends BaseStore {
  constructor() {
    super();

    this._pagingInfoByQuery = {};
  }

  list(options) {
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

    return API.listThreads(apiOptions).then(result => {
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
  }
}

module.exports = new ThreadStore();
