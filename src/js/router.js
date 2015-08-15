/** @flow */

type Params = {[key: string]: string;};
type Query = {[key: string]: string;};

// Proxy calls to router to avoid circular dependencies
// https://github.com/rackt/react-router/blob/master/docs/guides/flux.md#circular-dependencies-in-actions
let router;

module.exports = {
  getCurrentPath(): string {
    return router.getCurrentPath();
  },

  makePath(to: string, params?: Params, query?: Query): string {
    return router.makePath(to, params, query);
  },

  makeHref(to: string, params?: Params, query?: Query): string {
    return router.makeHref(to, params, query);
  },

  transitionTo(to: string, params?: Params, query?: Query) {
    router.transitionTo(to, params, query);
  },

  replaceWith(to: string, params?: Params, query?: Query) {
    router.replaceWith(to, params, query);
  },

  goBack() {
    router.goBack();
  },

  run(render: (component: any, state: {params: Params}) => void) {
    router.run(render);
  }
};

const Router = require('react-router');
const routes = require('./routes');

router = Router.create({
  routes: routes,
  // location: Router.HistoryLocation
});
