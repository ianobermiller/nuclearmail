/** @flow */

require('es6-shim');

var AppActions = require('./AppActions');
var ActionType = require('./ActionType');
var Dispatcher = require('./Dispatcher');
var React = require('react');
var moment = require('moment');
var router = require('./router');

// Configure moment
moment.locale('en', {
  calendar : {
    lastDay : 'MMM D',
    sameDay : 'LT',
    nextDay : 'MMM D',
    lastWeek : 'MMM D',
    nextWeek : 'MMM D',
    sameElse : 'L'
  }
});

// Expose React for the dev tools
window.React = React;

router.run((Handler, state) => {
  AppActions.routeChanged(state);
  React.render(<Handler />, document.body);
});

Dispatcher.subscribe((action) => {
  switch (action.type) {
    case ActionType.Message.SELECT:
      if (action.message) {
        router.transitionTo(
          'thread',
          {messageID: action.message.id, threadID: action.message.threadID}
        );
      } else {
        router.transitionTo('app');
      }
      break;
  }
});
