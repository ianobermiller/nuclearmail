/** @flow */

const ActionType = require('./ActionType');

const defaultState = {
  isAuthorized: false,
  isAuthorizing: false,
};

module.exports = (state = defaultState, action) => {
  switch (action.type) {
    case ActionType.Authorization.REQUEST:
      return {
        ...state,
        isAuthorizing: true,
      };
    case ActionType.Authorization.SUCCESS:
      return {
        ...state,
        isAuthorized: true,
        isAuthorizing: false,
      };
    case ActionType.Authorization.FAILURE:
      return {
        ...state,
        isAuthorized: false,
        isAuthorizing: false,
      };
  }
  return state;
};
