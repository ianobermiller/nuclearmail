/** @jsx React.DOM */

var ActionType = {
  Message: {
    ADD_MANY: null,
  },

  Thread: {
    MARK_AS_READ_STARTED: null,
    MARK_AS_READ_COMPLETED: null,
    MARK_AS_READ_FAILED: null,
  }
};

Object.keys(ActionType).forEach(category => {
  Object.keys(ActionType[category]).forEach(actionType => {
    ActionType[category][actionType] = category + '.' + actionType;
  });
});

module.exports = ActionType;
