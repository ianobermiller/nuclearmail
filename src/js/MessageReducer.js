/** @flow */

var ActionType = require('./ActionType');

module.exports = (messagesByID = {}, action) => {
  switch (action.type) {
    case ActionType.Thread.LOAD_SUCCESS:
    case ActionType.Thread.LOAD_LIST_SUCCESS:
      return action.messages.reduce(
        (newMessagesByID, message) => {
          newMessagesByID[message.id] = message
          return newMessagesByID;
        },
        {...messagesByID},
      );

    case ActionType.Thread.MARK_AS_READ_REQUEST:
      return _updateMessagesWhere(
        messagesByID,
        {threadID: action.threadID, isUnread: true},
        {isUnread: false},
      );

    case ActionType.Thread.MARK_AS_UNREAD_REQUEST:
      return _updateMessagesWhere(
        messagesByID,
        {threadID: action.threadID, isUnread: false},
        {isUnread: true},
      );

    case ActionType.Thread.ARCHIVE_REQUEST:
      return _updateMessagesWhere(
        messagesByID,
        {threadID: action.threadID, isInInbox: true},
        {isInInbox: false},
      );

    case ActionType.Thread.STAR_REQUEST:
      return _updateMessagesWhere(
        messagesByID,
        {threadID: action.threadID, isStarred: false},
        {isStarred: true},
      );

    case ActionType.Thread.UNSTAR_REQUEST:
      return _updateMessagesWhere(
        messagesByID,
        {threadID: action.threadID, isStarred: true},
        {isStarred: false},
      );
  }
  return messagesByID;
};

function _updateMessagesWhere(messagesByID, where, updates) {
  var newMessagesByID = {...messagesByID};
  var updatedMessages = _.filter(messagesByID, where)
    .map(message => ({...message, ...updates}))
    .forEach(message => newMessagesByID[message.id] = message);

  return newMessagesByID;
}
