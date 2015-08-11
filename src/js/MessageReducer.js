/** @flow */

var ActionType = require('./ActionType');

// State is messagesByID
module.exports = (state = {}, action) => {
  switch (action.type) {
    case ActionType.Message.ADD_MANY:
      return action.messages.reduce(
        (messagesByID, message) => {
          messagesByID[message.id] = message
          return messagesByID;
        },
        {...state}
      );
  }
  return state;
};
