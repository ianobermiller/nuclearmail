/** @flow */

// Proxy calls to router to avoid circular dependencies
// https://github.com/rackt/react-router/blob/master/docs/guides/flux.md#circular-dependencies-in-actions
var router: any;

module.exports = {
  getCurrentPath(): string {
    return router.getCurrentPath();
  },

  makePath(to: string, params?: Object, query?: Object): string {
    return router.makePath(to, params, query);
  },

  makeHref(to: string, params?: Object, query?: Object): string {
    return router.makeHref(to, params, query);
  },

  transitionTo(to: string, params?: Object, query?: Object) {
    router.transitionTo(to, params, query);
  },

  replaceWith(to: string, params?: Object, query?: Object) {
    router.replaceWith(to, params, query);
  },

  goBack() {
    router.goBack();
  },

  run(render: Function) {
    router.run(render);
  }
};

var Router = require('react-router');
var routes = require('./routes');

router = Router.create({
  routes: routes,
  // location: Router.HistoryLocation
});
