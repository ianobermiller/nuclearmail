var ActionType = require('./ActionType');

module.exports = (threadListByQuery = {}, action) => {
  switch (action.type) {
    case ActionType.Thread.LOAD_LIST_REQUEST:
      const threadList = threadListByQuery[action.query];
      if (threadList) {
        return {
          ...threadListByQuery,
          [action.query]: {
            ...threadList,
            isFetching: true,
          },
        };
      }

      return {
        ...threadListByQuery,
        [action.query]: {
          threadIDs: [],
          nextPageToken: null,
          resultSizeEstimate: null,
          isFetching: true,
        },
      };

    case ActionType.Thread.LOAD_LIST_SUCCESS:
      const threadList = threadListByQuery[action.query];
      const newThreadIDs = action.threads.map(thread => thread.id);
      return {
        ...threadListByQuery,
        [action.query]: {
          threadIDs: [...threadList.threadIDs, ...newThreadIDs],
          nextPageToken: action.nextPageToken,
          resultSizeEstimate: action.resultSizeEstimate,
          isFetching: false,
        },
      };
  }
  return threadListByQuery;
};
