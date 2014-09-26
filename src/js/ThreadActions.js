/** @jsx React.DOM */

var ActionType = require('./ActionType');
var API = require('./API');
var Dispatcher = require('./Dispatcher');

'use strict';

module.exports.refresh = () => {
  Dispatcher.dispatch({type: ActionType.Thread.REFRESH});
};

module.exports.markAsRead = threadID => {
  Dispatcher.dispatch({
    type: ActionType.Thread.MARK_AS_READ_STARTED,
    threadID,
  });

  API.markThreadAsRead({threadID}).then(() =>
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
};

module.exports.markAsUnread = threadID => {
  Dispatcher.dispatch({
    type: ActionType.Thread.MARK_AS_UNREAD_STARTED,
    threadID,
  });

  API.markThreadAsUnread({threadID}).then(() =>
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
};

module.exports.archive = threadID => {
  Dispatcher.dispatch({
    type: ActionType.Thread.ARCHIVE_STARTED,
    threadID,
  });

  API.archiveThread({threadID}).then(() =>
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
};

module.exports.star = threadID => {
  Dispatcher.dispatch({
    type: ActionType.Thread.STAR_STARTED,
    threadID,
  });

  API.starThread({threadID}).then(() =>
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
};


module.exports.unstar = threadID => {
  Dispatcher.dispatch({
    type: ActionType.Thread.UNSTAR_STARTED,
    threadID,
  });

  API.unstarThread({threadID}).then(() =>
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
};
