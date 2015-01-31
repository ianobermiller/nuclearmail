/** @flow */

require('es6-shim');

var AppActions = require('./AppActions');
var ActionType = require('./ActionType');
var Dispatcher = require('./Dispatcher');
var React = require('react');
var router = require('./router');

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
