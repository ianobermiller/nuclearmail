/** @flow */


var App = require('./App');
var ThreadView = require('./ThreadView');
var React = require('react');
var Router = require('react-router');

var Route = Router.Route;

var routes = (
  <Route name="app" path="/" handler={App}>
    <Route
      name="thread"
      path="/thread/:threadID/message/:messageID"
      handler={ThreadView}
    />
  </Route>
);

module.exports = routes;
