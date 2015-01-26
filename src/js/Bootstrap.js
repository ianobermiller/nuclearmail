/** @flow */

require('es6-shim');

var App = require('./App');
var React = require('react');
var moment = require('moment');

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

React.render(<App />, document.body);
