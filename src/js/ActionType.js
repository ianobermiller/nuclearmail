/** @flow */

var ActionType = {
  Message: {
    ADD_MANY: '',
    SELECT: '',
  },

  Thread: {
    ARCHIVE_STARTED: '',
    ARCHIVE_COMPLETED: '',
    ARCHIVE_FAILED: '',

    MOVE_TO_INBOX_STARTED: '',
    MOVE_TO_INBOX_COMPLETED: '',
    MOVE_TO_INBOX_FAILED: '',

    MARK_AS_READ_STARTED: '',
    MARK_AS_READ_COMPLETED: '',
    MARK_AS_READ_FAILED: '',

    MARK_AS_UNREAD_STARTED: '',
    MARK_AS_UNREAD_COMPLETED: '',
    MARK_AS_UNREAD_FAILED: '',

    REFRESH: '',

    STAR_STARTED: '',
    STAR_COMPLETED: '',
    STAR_FAILED: '',

    UNSTAR_STARTED: '',
    UNSTAR_COMPLETED: '',
    UNSTAR_FAILED: '',
  }
};

Object.keys(ActionType).forEach(category => {
  Object.keys(ActionType[category]).forEach(actionType => {
    ActionType[category][actionType] = category + '.' + actionType;
  });
});

module.exports = ActionType;
