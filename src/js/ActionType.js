/** @flow */

var ActionType = {
  Label: {
    LOAD_ALL_REQUEST: '',
    LOAD_ALL_SUCCESS: '',
    LOAD_ALL_FAILURE: '',
  },

  Message: {
    ADD_MANY: '',
    SELECT: '',
  },

  Thread: {
    LOAD_REQUEST: '',
    LOAD_SUCCESS: '',
    LOAD_FAILURE: '',

    LOAD_LIST_REQUEST: '',
    LOAD_LIST_SUCCESS: '',
    LOAD_LIST_FAILURE: '',

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

var ActionTypeHax: any = ActionType;
Object.keys(ActionTypeHax).forEach(category => {
  Object.keys(ActionTypeHax[category]).forEach(actionType => {
    ActionTypeHax[category][actionType] = category + '.' + actionType;
  });
});

module.exports = ActionType;
