/** @flow */

var ActionType = require('./ActionType');
var Dispatcher = require('./Dispatcher');
var ThreadAPI = require('./ThreadAPI');

'use strict';

function refresh() {
  Dispatcher.dispatch({type: ActionType.Thread.REFRESH});
}

function markAsRead(threadID: string) {
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

function markAsUnread(threadID: string) {
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

function archive(threadID: string) {
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

function moveToInbox(threadID: string) {
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

function star(threadID: string) {
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

function unstar(threadID: string) {
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

module.exports = {
  archive,
  markAsRead,
  markAsUnread,
  moveToInbox,
  refresh,
  star,
  unstar,
};
