/** @flow */

const App = require('./App');
const ThreadView = require('./ThreadView');
const React = require('react');
const Router = require('react-router');

const Route = Router.Route;

const routes = (
  <Route path="/" component={App}>
    <Route path="thread/:threadID/message/:messageID" component={ThreadView} />
  </Route>
);

module.exports = routes;
