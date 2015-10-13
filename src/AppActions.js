const ActionType = require('./ActionType');

export function search(searchQuery) {
  return {
    type: ActionType.App.SEARCH,
    searchQuery
  };
};
