/** @flow */

const App = require('./App');
const ThreadView = require('./ThreadView');
const React = require('react');
const Router = require('react-router');

const Route = Router.Route;

const routes = (
  <Route handler={App} name="app" path="/">
    <Route
      handler={ThreadView}
      name="thread"
      path="/thread/:threadID/message/:messageID"
    />
  </Route>
);

module.exports = routes;
