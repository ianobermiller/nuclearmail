/** @flow */

const ActionType = require('./ActionType');

module.exports = (appState = {searchQuery: 'in:inbox'}, action) => {
  switch (action.type) {
    case ActionType.App.SEARCH:
      return {
        ...appState,
        searchQuery: action.searchQuery,
      };
  }
  return appState;
};
