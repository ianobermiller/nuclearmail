import {createSelector} from 'reselect';
import _ from 'lodash';

import getUnsubscribeUrl from './getUnsubscribeUrl';

const searchQuerySelector = state => state.app.searchQuery;
const threadListByQuerySelector = state => state.threadListByQuery;
const threadsByIDSelector = state => state.threadsByID;
const messagesByIDSelector = state => state.messagesByID;

export const selectedMessageIDSelector = state => state.router.params.messageID;
export const selectedThreadIDSelector = state => state.router.params.threadID;

export const threadsSelector = createSelector([
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

export const selectedThreadMessagesSelector = createSelector([
  threadsByIDSelector,
  selectedThreadIDSelector,
  messagesByIDSelector,
], (
  threadsByID,
  selectedThreadID,
  messagesByID,
) => {
  const selectedThread = threadsByID[selectedThreadID];
  return selectedThread &&
    selectedThread.messageIDs.map(messageID => messagesByID[messageID]);
});

export const unsubscribeUrlSelector = createSelector([
  selectedThreadMessagesSelector,
  selectedMessageIDSelector,
], (
  messages,
  selectedMesageID,
) => {
  const selectedMessage = messages && messages.find(
    message => message.id === selectedMesageID
  );

  return selectedMessage && getUnsubscribeUrl(selectedMessage);
});

export const lastMessageInEachThreadSelector = createSelector([
  messagesByIDSelector,
  threadsSelector
], (
  messagesByID,
  threads
) => {
  return threads && threads.map(
    thread => messagesByID[_.last(thread.messageIDs)]
  );
});

export const hasMoreThreadsSelector = createSelector([
  searchQuerySelector,
  threadListByQuerySelector,
], (
  searchQuery,
  threadListByQuery,
) => {
  const threadList = threadListByQuery[searchQuery];
  return !threadList || !!threadList.nextPageToken;
});

export const loadedThreadCountSelector = createSelector([
  searchQuerySelector,
  threadListByQuerySelector,
], (
  searchQuery,
  threadListByQuery,
) => {
  const threadList = threadListByQuery[searchQuery];
  return threadList ? threadList.threadIDs.length : 0;
});

export const nextMessageSelector = createSelector([
  lastMessageInEachThreadSelector,
  selectedMessageIDSelector,
], (
  messages,
  selectedMessageID
) => {
  if (!messages) {
    return null;
  }

  const selectedMessageIndex = selectedMessageID &&
    messages.findIndex(
      msg => msg.id === selectedMessageID
    );

  if (!selectedMessageID) {
    return messages[0];
  } else if (selectedMessageIndex < 0 || selectedMessageIndex === messages.length) {
    return null;
  } else {
    return messages[selectedMessageIndex + 1];
  }
});

export const prevMessageSelector = createSelector([
  lastMessageInEachThreadSelector,
  selectedMessageIDSelector,
], (
  messages,
  selectedMessageID
) => {
  if (!messages) {
    return null;
  }

  const selectedMessageIndex = selectedMessageID &&
    messages.findIndex(
      msg => msg.id === selectedMessageID
    );

  if (!selectedMessageID) {
    return messages[0];
  } else if (selectedMessageIndex < 0 || selectedMessageIndex === 0) {
    return null;
  } else {
    return messages[selectedMessageIndex - 1];
  }
});
