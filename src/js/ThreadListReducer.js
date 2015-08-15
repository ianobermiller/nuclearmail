const ActionType = require('./ActionType');

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

    case ActionType.Thread.REFRESH:
      console.log('clearing the store')
      return {};

    case ActionType.Thread.ARCHIVE_REQUEST:
      return removeThread(threadListByQuery, action.threadID, /in\:\s*inbox/);

    case ActionType.Thread.MOVE_TO_INBOX_REQUEST:
      return removeMatchingQueries(threadListByQuery, /in\:\s*inbox/);

    case ActionType.Thread.UNSTAR_REQUEST:
      return removeThread(
        threadListByQuery,
        action.threadID,
        /is\:\s*starred/
      );
  }
  return threadListByQuery;
};

function removeThread(threadListByQuery, threadIDToRemove, queryRegex) {
  return Object.keys(threadListByQuery)
    .reduce((newThreadListByQuery, query) => {
      if (queryRegex.test(query)) {
        const existingThreadList = threadListByQuery[query];
        const newThreadIDs = existingThreadList.threadIDs.filter(
          threadID => threadID !== threadIDToRemove
        );
        if (newThreadIDs.length < existingThreadList.threadIDs.length) {
          newThreadListByQuery[query] = {
            ...existingThreadList,
            threadIDs: newThreadIDs,
          };
        } else {
          newThreadListByQuery[query] = existingThreadList;
        }
      }

      return newThreadListByQuery;
    }, {});
}

function removeMatchingQueries(threadListByQuery, queryRegex) {
  return Object.keys(threadListByQuery)
    .reduce((newThreadListByQuery, query) => {
      if (!queryRegex.test(query)) {
        newThreadListByQuery[query] = threadListByQuery[query];
      }

      return newThreadListByQuery;
    }, {});
}
