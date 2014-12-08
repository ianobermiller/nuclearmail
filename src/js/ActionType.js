/** @jsx React.DOM */

var ActionType = {
  Message: {
    ADD_MANY: null,
  },

  Thread: {
    ARCHIVE_STARTED: null,
    ARCHIVE_COMPLETED: null,
    ARCHIVE_FAILED: null,

    MOVE_TO_INBOX_STARTED: null,
    MOVE_TO_INBOX_COMPLETED: null,
    MOVE_TO_INBOX_FAILED: null,

    MARK_AS_READ_STARTED: null,
    MARK_AS_READ_COMPLETED: null,
    MARK_AS_READ_FAILED: null,

    MARK_AS_UNREAD_STARTED: null,
    MARK_AS_UNREAD_COMPLETED: null,
    MARK_AS_UNREAD_FAILED: null,

    STAR_STARTED: null,
    STAR_COMPLETED: null,
    STAR_FAILED: null,

    UNSTAR_STARTED: null,
    UNSTAR_COMPLETED: null,
    UNSTAR_FAILED: null,
  }
};

Object.keys(ActionType).forEach(category => {
  Object.keys(ActionType[category]).forEach(actionType => {
    ActionType[category][actionType] = category + '.' + actionType;
  });
});

module.exports = ActionType;
