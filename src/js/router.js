/** @flow */

var Router = require('react-router');
var routes = require('./routes');

var router = Router.create({
  routes: routes,
  // location: Router.HistoryLocation
});

module.exports = router;
