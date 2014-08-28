/** @jsx React.DOM */

var ActionType = {
  Message: {
    ADD_MANY: null,
  }
};

Object.keys(ActionType).forEach(category => {
  Object.keys(ActionType[category]).forEach(actionType => {
    ActionType[category][actionType] = category + '.' + actionType;
  });
});

module.exports = ActionType;
