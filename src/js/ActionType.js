/** @flow */

const ActionType = {
  Label: {
    LOAD_ALL_REQUEST: '',
    LOAD_ALL_SUCCESS: '',
    LOAD_ALL_FAILURE: '',
  },

  Message: {
    SELECT: '',
  },

  Thread: {
    LOAD_REQUEST: '',
    LOAD_SUCCESS: '',
    LOAD_FAILURE: '',

    LOAD_LIST_REQUEST: '',
    LOAD_LIST_SUCCESS: '',
    LOAD_LIST_FAILURE: '',

    ARCHIVE_REQUEST: '',
    ARCHIVE_SUCCESS: '',
    ARCHIVE_FAILURE: '',

    MOVE_TO_INBOX_REQUEST: '',
    MOVE_TO_INBOX_SUCCESS: '',
    MOVE_TO_INBOX_FAILURE: '',

    MARK_AS_READ_REQUEST: '',
    MARK_AS_READ_SUCCESS: '',
    MARK_AS_READ_FAILURE: '',

    MARK_AS_UNREAD_REQUEST: '',
    MARK_AS_UNREAD_SUCCESS: '',
    MARK_AS_UNREAD_FAILURE: '',

    REFRESH: '',

    STAR_REQUEST: '',
    STAR_SUCCESS: '',
    STAR_FAILURE: '',

    UNSTAR_REQUEST: '',
    UNSTAR_SUCCESS: '',
    UNSTAR_FAILURE: '',
  }
};

const ActionTypeHax: any = ActionType;
Object.keys(ActionTypeHax).forEach(category => {
  Object.keys(ActionTypeHax[category]).forEach(actionType => {
    ActionTypeHax[category][actionType] = category + '.' + actionType;
  });
});

module.exports = ActionType;
