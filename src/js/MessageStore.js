/** @flow */

var API = require('./API.js');
var ActionType = require('./ActionType.js');
var BaseStore = require('./BaseStore.js');
var _ = require('lodash');

class MessageStore extends BaseStore {
  _messagesByID: {[id: string]: Object};

  constructor() {
    super();

    this._messagesByID = {};
  }

  handleDispatch(action: any) {
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

  _updateMessagesWhere(where: Object, updates: Object) {
    var didChange = false;
    _.filter(
      this._messagesByID,
      where
    ).forEach(msg => {
      didChange = true;
      this._messagesByID[msg.id] = {...msg, ...updates};
    });
    didChange && this.emitChange();
  }

  getByIDs({ids}: {ids: Array<string>}): Array<Object> {
    return _.chain(ids).map(id => this._messagesByID[id]).compact().value();
  }
}

module.exports = new MessageStore();
