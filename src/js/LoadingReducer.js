/** @flow */

const ActionType = require('./ActionType');

module.exports = (state = false, action) => {
  switch (action.type) {
    case ActionType.Request.START:
      return true;
    case ActionType.Request.ALL_STOPPED:
      return false;
  }
  return state;
};
