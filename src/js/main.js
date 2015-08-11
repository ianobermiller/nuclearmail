/** @flow */

import 'es6-shim';

import {Provider} from 'react-redux';

function run() {
  const React = require('react');
  const router = require('./router');
  const store = require('./store');

  router.run((Handler, state) => {
    React.render(
      <Provider store={store}>
        {() => <Handler params={state.params} />}
      </Provider>,
      document.body
    );
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
