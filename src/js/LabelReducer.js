/** @flow */

var ActionType = require('./ActionType');

module.exports = (state = [], action) => {
  switch (action.type) {
    case ActionType.Label.LOAD_ALL_COMPLETED:
      return action.labels;
  }
  return state;
};
