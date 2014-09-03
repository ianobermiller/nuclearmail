/** @jsx React.DOM */

var ActionType = require('./ActionType');
var API = require('./API');
var Dispatcher = require('./Dispatcher');

'use strict';

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
  ).catch(() =>
    Dispatcher.dispatch({
      type: ActionType.Thread.MARK_AS_READ_FAILED,
      threadID,
    })
  );
};
