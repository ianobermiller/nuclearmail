/** @flow */

var App = require('./App');
var ThreadView = require('./ThreadView');
var React = require('react');
var Router = require('react-router');

var Route = Router.Route;

var routes = (
  <Route handler={App} name="app" path="/">
    <Route
      handler={ThreadView}
      name="thread"
      path="/thread/:threadID/message/:messageID"
    />
  </Route>
);

module.exports = routes;
