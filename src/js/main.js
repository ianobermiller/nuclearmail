/** @flow */

require('es6-shim');

import {Provider} from 'react-redux';
import {applyMiddleware, combineReducers, createStore} from 'redux';
import thunk from 'redux-thunk'

function run() {
  const React = require('react');
  const router = require('./router');
  const LabelReducer = require('./LabelReducer');

  const reducer = combineReducers({
    labels: LabelReducer,
  });
  const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
  const store = createStoreWithMiddleware(reducer);

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
