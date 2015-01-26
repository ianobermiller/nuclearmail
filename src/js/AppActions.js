/** @flow */

var ActionType = require('./ActionType');
var Dispatcher = require('./Dispatcher');
var ThreadAPI = require('./ThreadAPI');

'use strict';

function routeChanged(state) {
  Dispatcher.dispatch({type: ActionType.App.ROUTE_CHANGED, state});
}

module.exports = {
  routeChanged,
};
