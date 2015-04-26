/** @flow */

var API = require('./API');
var ActionType = require('./ActionType');
var BaseStore = require('./BaseStore');
var MessageAPI = require('./MessageAPI');
var _ = require('lodash');

import type {TMessage} from './Types';
type Message = typeof TMessage;

class MessageStore extends BaseStore {
  _messagesByID: {[id: string]: Message};

  constructor() {
    super();

    this._messagesByID = {};

    this.loadCachedData();
  }

  handleDispatch(
    action: {
      type: string;
      messages?: Array<Message>;
      threadID?: string;
    }
  ): void {
    switch (action.type) {
      case ActionType.Message.ADD_MANY:
        if (!action.messages) throw new Error('messages null');
        action.messages.forEach(message => {
          this._messagesByID[message.id] = message;
        });
        this.emitChange();
        break;

      case ActionType.Thread.MARK_AS_READ_STARTED:
        if (!action.threadID) throw new Error('threadID null');
        this._updateMessagesWhere(
          {threadID: action.threadID, isUnread: true},
          {isUnread: false}
        );
        break;

      case ActionType.Thread.MARK_AS_UNREAD_STARTED:
        if (!action.threadID) throw new Error('threadID null');
        this._updateMessagesWhere(
          {threadID: action.threadID, isUnread: false},
          {isUnread: true}
        );
        break;

      case ActionType.Thread.ARCHIVE_STARTED:
        if (!action.threadID) throw new Error('threadID null');
        this._updateMessagesWhere(
          {threadID: action.threadID, isInInbox: true},
          {isInInbox: false}
        );
        break;

      case ActionType.Thread.STAR_STARTED:
        if (!action.threadID) throw new Error('threadID null');
        this._updateMessagesWhere(
          {threadID: action.threadID, isStarred: false},
          {isStarred: true}
        );
        break;

      case ActionType.Thread.UNSTAR_STARTED:
        if (!action.threadID) throw new Error('threadID null');
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

  getByIDs(options: {ids: Array<string>}): ?Array<Message> {
    var existing = _.chain(options.ids)
      .map(id => this._messagesByID[id])
      .compact()
      .value();

    if (existing.length === options.ids.length) {
      return existing;
    }

    var idsToFetch = _.difference(
      options.ids,
      existing.map(message => message.id)
    );

    MessageAPI.getByIDs({ids: idsToFetch}).then(messages => {
      messages.forEach(message => this._messagesByID[message.id] = message);
      this.emitChange();
    });

    return null;
  }
}

module.exports = new MessageStore();
