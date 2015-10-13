/** @flow */

import ActionType from './ActionType';
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

    ThreadAPI.getByID({id: threadID}).then(({thread, messages}) => {
      dispatch({
        type: ActionType.Thread.LOAD_SUCCESS,
        threadID,
        thread,
        messages,
      });
    }).catch(error => {
      dispatch({
        type: ActionType.Thread.LOAD_FAILURE,
        threadID,
        error,
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
        threads: listResult.threads,
        messages: listResult.messages,
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
  return dispatch => {
    dispatch({
      type: ActionType.Thread.MARK_AS_READ_REQUEST,
      threadID,
    });

    ThreadAPI.markAsRead({threadID}).then(() =>
      dispatch({
        type: ActionType.Thread.MARK_AS_READ_SUCCESS,
        threadID,
      })
    ).catch(error =>
      dispatch({
        type: ActionType.Thread.MARK_AS_READ_FAILURE,
        threadID,
        error,
      })
    );
  };
}

export function markAsUnread(threadID: string) {
  return dispatch => {
    dispatch({
      type: ActionType.Thread.MARK_AS_UNREAD_REQUEST,
      threadID,
    });

    ThreadAPI.markAsUnread({threadID}).then(() =>
      dispatch({
        type: ActionType.Thread.MARK_AS_UNREAD_SUCCESS,
        threadID,
      })
    ).catch(error =>
      dispatch({
        type: ActionType.Thread.MARK_AS_UNREAD_FAILURE,
        threadID,
        error,
      })
    );
  };
}

export function archive(threadID: string) {
  return dispatch => {
    dispatch({
      type: ActionType.Thread.ARCHIVE_REQUEST,
      threadID,
    });

    ThreadAPI.archive({threadID}).then(() =>
      dispatch({
        type: ActionType.Thread.ARCHIVE_SUCCESS,
        threadID,
      })
    ).catch(error =>
      dispatch({
        type: ActionType.Thread.ARCHIVE_FAILURE,
        threadID,
        error,
      })
    );
  };
}

export function moveToInbox(threadID: string) {
  return dispatch => {
    dispatch({
      type: ActionType.Thread.MOVE_TO_INBOX_REQUEST,
      threadID,
    });

    ThreadAPI.moveToInbox({threadID}).then(() =>
      dispatch({
        type: ActionType.Thread.MOVE_TO_INBOX_SUCCESS,
        threadID,
      })
    ).catch(error =>
      dispatch({
        type: ActionType.Thread.MOVE_TO_INBOX_FAILURE,
        threadID,
        error,
      })
    );
  };
}

export function star(threadID: string) {
  return dispatch => {
    dispatch({
      type: ActionType.Thread.STAR_REQUEST,
      threadID,
    });

    ThreadAPI.star({threadID}).then(() =>
      dispatch({
        type: ActionType.Thread.STAR_SUCCESS,
        threadID,
      })
    ).catch(error =>
      dispatch({
        type: ActionType.Thread.STAR_FAILURE,
        threadID,
        error,
      })
    );
  };
}

export function unstar(threadID: string) {
  return dispatch => {
    dispatch({
      type: ActionType.Thread.UNSTAR_REQUEST,
      threadID,
    });

    ThreadAPI.unstar({threadID}).then(() =>
      dispatch({
        type: ActionType.Thread.UNSTAR_SUCCESS,
        threadID,
      })
    ).catch(error =>
      dispatch({
        type: ActionType.Thread.UNSTAR_FAILURE,
        threadID,
        error,
      })
    );
  };
}
