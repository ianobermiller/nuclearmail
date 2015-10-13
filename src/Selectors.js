import {createSelector} from 'reselect';
import _ from 'lodash';

const searchQuerySelector = state => state.app.searchQuery;
const threadListByQuerySelector = state => state.threadListByQuery;
const threadsByIDSelector = state => state.threadsByID;
const messagesByIDSelector = state => state.messagesByID;

export const threadsForSearchSelector = createSelector([
  searchQuerySelector,
  threadListByQuerySelector,
  threadsByIDSelector,
], (
  searchQuery,
  threadListByQuery,
  threadsByID,
) => {
  const threadList = threadListByQuery[searchQuery];
  return threadList ?
    threadList.threadIDs.map(threadID => threadsByID[threadID]) :
    [];
});

export const lastMessageInThreadsForSearchSelector = createSelector([
  messagesByIDSelector,
  threadsForSearchSelector
], (
  messagesByID,
  threads
) => {
  return threads && threads.map(
    thread => messagesByID[_.last(thread.messageIDs)]
  );
});
