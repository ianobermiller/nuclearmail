/** @jsx React.DOM */

var API = require('./API.js');
var ActionType = require('./ActionType.js');
var BaseStore = require('./BaseStore.js');
var _ = require('lodash');

class MessageStore extends BaseStore {
  constructor() {
    super();

    this._cache = {};
    this._pagingInfoByQuery = {};
    this._messagesByID = {};
  }

  handleDispatch(action) {
    switch (action.type) {
      case ActionType.Message.ADD_MANY:
        action.messages.forEach(message => {
          this._messagesByID[message.id] = message;
        });
        this.emitChange();
        break;

      case ActionType.Thread.MARK_AS_READ_STARTED:
        this._updateMessagesWhere(
          {threadID: action.threadID, isUnread: true},
          {isUnread: false}
        );
        break;

      case ActionType.Thread.MARK_AS_UNREAD_STARTED:
        this._updateMessagesWhere(
          {threadID: action.threadID, isUnread: false},
          {isUnread: true}
        );
        break;

      case ActionType.Thread.ARCHIVE_STARTED:
        this._updateMessagesWhere(
          {threadID: action.threadID, isInInbox: true},
          {isInInbox: false}
        );
        break;

      case ActionType.Thread.STAR_STARTED:
        this._updateMessagesWhere(
          {threadID: action.threadID, isStarred: false},
          {isStarred: true}
        );
        break;

      case ActionType.Thread.UNSTAR_STARTED:
        this._updateMessagesWhere(
          {threadID: action.threadID, isStarred: true},
          {isStarred: false}
        );
        break;
    }
  }

  _updateMessagesWhere(where, updates) {
    var didChange = false;
    _.filter(
      this._messagesByID,
      where
    ).forEach(msg => {
      didChange = true;
      this._messagesByID[msg.id] = Object.assign(
        {},
        msg,
        updates
      );
    });
    didChange && this.emitChange();
  }

  getByIDs({ids}) {
    var messages = ids.map(id => this._messagesByID[id]);
    return Promise.resolve(messages);
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

    return API.listMessages(apiOptions).then(result => {
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

module.exports = new MessageStore();
