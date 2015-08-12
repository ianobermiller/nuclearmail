var ActionType = require('./ActionType');

module.exports = (threadsByID = {}, action) => {
  switch (action.type) {
    case ActionType.Thread.LOAD_REQUEST:
      // To prevent double fetching, store a null entry when we start loading
      return {
        ...threadsByID,
        [action.threadID]: threadsByID[action.threadID] || null,
      };

    case ActionType.Thread.LOAD_SUCCESS:
      return {
        ...threadsByID,
        [action.thread.id]: action.thread,
      };

    case ActionType.Thread.LOAD_LIST_SUCCESS:
      return action.threads.reduce(
        (newThreadsByID, message) => {
          newThreadsByID[message.id] = message
          return newThreadsByID;
        },
        {...threadsByID}
      );
  }
  return threadsByID;
};
