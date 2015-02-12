/** @flow */

type Params = {[key: string]: string;};

// Proxy calls to router to avoid circular dependencies
// https://github.com/rackt/react-router/blob/master/docs/guides/flux.md#circular-dependencies-in-actions
var router: any;

module.exports = {
  getCurrentPath(): string {
    return router.getCurrentPath();
  },

  makePath(to: string, params?: Params, query?: Object): string {
    return router.makePath(to, params, query);
  },

  makeHref(to: string, params?: Params, query?: Object): string {
    return router.makeHref(to, params, query);
  },

  transitionTo(to: string, params?: Params, query?: Object) {
    router.transitionTo(to, params, query);
  },

  replaceWith(to: string, params?: Params, query?: Object) {
    router.replaceWith(to, params, query);
  },

  goBack() {
    router.goBack();
  },

  run(render: (component: any, state: {params: Params}) => void) {
    router.run(render);
  }
};

var Router = require('react-router');
var routes = require('./routes');

router = Router.create({
  routes: routes,
  // location: Router.HistoryLocation
});
