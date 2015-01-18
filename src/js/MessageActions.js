/** @flow */

var ActionType = require('./ActionType');
var Dispatcher = require('./Dispatcher');

'use strict';

function select(message: ?Object) {
  Dispatcher.dispatch({type: ActionType.Message.SELECT, message});
}

module.exports = {
  select,
};
