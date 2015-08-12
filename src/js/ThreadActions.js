/** @flow */

import ActionType from './ActionType';
import Dispatcher from './Dispatcher';
import ThreadAPI from './ThreadAPI';

export function load(threadID) {
  return (dispatch, getState) => {
    const {threadsByID} = getState();
    if (threadsByID.hasOwnProperty(threadID)) {
      // Already loading
      return;
    }

    dispatch({
      type: ActionType.Thread.LOAD_REQUEST,
      threadID,
    });

    ThreadAPI.getByID({id: threadID}).then(thread => {
      dispatch({
        type: ActionType.Thread.LOAD_SUCCESS,
        threadID,
        thread
      });
    }).catch(error => {
      dispatch({
        type: ActionType.Thread.LOAD_FAILURE,
        threadID,
        error
      });
    });
  };
}

export function loadList(query = '', requestedResultCount = 10) {
  return (dispatch, getState) => {
    const {threadListByQuery} = getState();
    const threadList = threadListByQuery[query];

    let pageToken = null;
    let resultsStillNeeded = requestedResultCount;
    if (threadList) {
      resultsStillNeeded = requestedResultCount - threadList.threadIDs.length;
      pageToken = threadList.nextPageToken;

      if (resultsStillNeeded <= 0 || !pageToken || threadList.isFetching) {
        return;
      }
    }

    dispatch({
      type: ActionType.Thread.LOAD_LIST_REQUEST,
      query,
      requestedResultCount,
    });

    ThreadAPI.list({
      query,
      pageToken,
      maxResults: resultsStillNeeded,
    }).then(listResult => {
      dispatch({
        type: ActionType.Thread.LOAD_LIST_SUCCESS,
        query,
        requestedResultCount,
        threads: listResult.items,
        nextPageToken: listResult.nextPageToken,
        resultSizeEstimate: listResult.resultSizeEstimate,
      });
    }).catch(error => {
      dispatch({
        type: ActionType.Thread.LOAD_LIST_FAILURE,
        query,
        requestedResultCount,
      });
    });
  };
}

export function refresh() {
  return {type: ActionType.Thread.REFRESH};
}

export function markAsRead(threadID: string) {
  Dispatcher.dispatch({
    type: ActionType.Thread.MARK_AS_READ_STARTED,
    threadID,
  });

  ThreadAPI.markAsRead({threadID}).then(() =>
    Dispatcher.dispatch({
      type: ActionType.Thread.MARK_AS_READ_COMPLETED,
      threadID,
    })
  ).catch(error =>
    Dispatcher.dispatch({
      type: ActionType.Thread.MARK_AS_READ_FAILED,
      threadID,
      error,
    })
  );
}

export function markAsUnread(threadID: string) {
  Dispatcher.dispatch({
    type: ActionType.Thread.MARK_AS_UNREAD_STARTED,
    threadID,
  });

  ThreadAPI.markAsUnread({threadID}).then(() =>
    Dispatcher.dispatch({
      type: ActionType.Thread.MARK_AS_UNREAD_COMPLETED,
      threadID,
    })
  ).catch(error =>
    Dispatcher.dispatch({
      type: ActionType.Thread.MARK_AS_UNREAD_FAILED,
      threadID,
      error,
    })
  );
}

export function archive(threadID: string) {
  Dispatcher.dispatch({
    type: ActionType.Thread.ARCHIVE_STARTED,
    threadID,
  });

  ThreadAPI.archive({threadID}).then(() =>
    Dispatcher.dispatch({
      type: ActionType.Thread.ARCHIVE_COMPLETED,
      threadID,
    })
  ).catch(error =>
    Dispatcher.dispatch({
      type: ActionType.Thread.ARCHIVE_FAILED,
      threadID,
      error,
    })
  );
}

export function moveToInbox(threadID: string) {
  Dispatcher.dispatch({
    type: ActionType.Thread.MOVE_TO_INBOX_STARTED,
    threadID,
  });

  ThreadAPI.moveToInbox({threadID}).then(() =>
    Dispatcher.dispatch({
      type: ActionType.Thread.MOVE_TO_INBOX_COMPLETED,
      threadID,
    })
  ).catch(error =>
    Dispatcher.dispatch({
      type: ActionType.Thread.MOVE_TO_INBOX_FAILED,
      threadID,
      error,
    })
  );
}

export function star(threadID: string) {
  Dispatcher.dispatch({
    type: ActionType.Thread.STAR_STARTED,
    threadID,
  });

  ThreadAPI.star({threadID}).then(() =>
    Dispatcher.dispatch({
      type: ActionType.Thread.STAR_COMPLETED,
      threadID,
    })
  ).catch(error =>
    Dispatcher.dispatch({
      type: ActionType.Thread.STAR_FAILED,
      threadID,
      error,
    })
  );
}

export function unstar(threadID: string) {
  Dispatcher.dispatch({
    type: ActionType.Thread.UNSTAR_STARTED,
    threadID,
  });

  ThreadAPI.unstar({threadID}).then(() =>
    Dispatcher.dispatch({
      type: ActionType.Thread.UNSTAR_COMPLETED,
      threadID,
    })
  ).catch(error =>
    Dispatcher.dispatch({
      type: ActionType.Thread.UNSTAR_FAILED,
      threadID,
      error,
    })
  );
}
