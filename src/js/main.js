/** @flow */

require('es6-shim');

function run() {
  var React = require('react');
  var router = require('./router');
  router.run((Handler, state) => {
    React.render(<Handler params={state.params} />, document.body);
  });
}

if (!window.Intl) {
  require.ensure([], () => {
    require('intl');
    run();
  });
} else {
  run();
}
