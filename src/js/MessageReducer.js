/** @flow */

var ActionType = require('./ActionType');

// State is messagesByID
module.exports = (messagesByID = {}, action) => {
  switch (action.type) {
    case ActionType.Message.ADD_MANY:
      return action.messages.reduce(
        (newMessagesByID, message) => {
          newMessagesByID[message.id] = message
          return newMessagesByID;
        },
        {...messagesByID}
      );

    case ActionType.Thread.MARK_AS_READ_STARTED:
      return _updateMessagesWhere(
        messagesByID,
        {threadID: action.threadID, isUnread: true},
        {isUnread: false}
      );

    case ActionType.Thread.MARK_AS_UNREAD_STARTED:
      return _updateMessagesWhere(
        messagesByID,
        {threadID: action.threadID, isUnread: false},
        {isUnread: true}
      );

    case ActionType.Thread.ARCHIVE_STARTED:
      return _updateMessagesWhere(
        messagesByID,
        {threadID: action.threadID, isInInbox: true},
        {isInInbox: false}
      );

    case ActionType.Thread.STAR_STARTED:
      return _updateMessagesWhere(
        messagesByID,
        {threadID: action.threadID, isStarred: false},
        {isStarred: true}
      );

    case ActionType.Thread.UNSTAR_STARTED:
      return _updateMessagesWhere(
        messagesByID,
        {threadID: action.threadID, isStarred: true},
        {isStarred: false}
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
