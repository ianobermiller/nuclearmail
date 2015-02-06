/** @flow */

// Proxy calls to router to avoid circular dependencies
// https://github.com/rackt/react-router/blob/master/docs/guides/flux.md#circular-dependencies-in-actions
var router;

module.exports = {
  getCurrentPath() {
    return router.getCurrentPath();
  },

  makePath(to, params, query) {
    return router.makePath(to, params, query);
  },

  makeHref(to, params, query) {
    return router.makeHref(to, params, query);
  },

  transitionTo(to, params, query) {
    router.transitionTo(to, params, query);
  },

  replaceWith(to, params, query) {
    router.replaceWith(to, params, query);
  },

  goBack() {
    router.goBack();
  },

  run(render) {
    router.run(render);
  }
};

var Router = require('react-router');
var routes = require('./routes');

router = Router.create({
  routes: routes,
  // location: Router.HistoryLocation
});
