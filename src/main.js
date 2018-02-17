/** @flow */

import 'es6-shim';

import {Provider} from 'react-redux';
import {ReduxRouter} from 'redux-react-router';
import {DevTools, DebugPanel, LogMonitor} from 'redux-devtools/lib/react';

function run() {
  const React = require('react');
  const ReactDOM = require('react-dom');
  const routes = require('./routes');
  const store = require('./store');

  ReactDOM.render(
    <div>
      <Provider store={store}>
        <ReduxRouter>
          {routes}
        </ReduxRouter>
      </Provider>
      <DebugPanel top right bottom>
        <DevTools store={store} monitor={LogMonitor} />
      </DebugPanel>
    </div>,
    document.getElementById('root'),
  );
}

if (!window.Intl) {
  require.ensure([], () => {
    require('intl');
    run();
  });
} else {
  run();
}
