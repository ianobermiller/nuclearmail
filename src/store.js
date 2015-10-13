import {applyMiddleware, combineReducers, createStore, compose} from 'redux';
import {reduxReactRouter, routerStateReducer} from 'redux-react-router';
import {devTools, persistState} from 'redux-devtools';
import {createHashHistory} from 'history';
import thunk from 'redux-thunk';

import AppReducer from './AppReducer';
import AuthorizationReducer from './AuthorizationReducer';
import LabelReducer from './LabelReducer';
import LoadingReducer from './LoadingReducer';
import MessageReducer from './MessageReducer';
import ThreadReducer from './ThreadReducer';
import ThreadListReducer from './ThreadListReducer';

const reducer = combineReducers({
  app: AppReducer,
  authorization: AuthorizationReducer,
  isLoading: LoadingReducer,
  labels: LabelReducer,
  messagesByID: MessageReducer,
  router: routerStateReducer,
  threadListByQuery: ThreadListReducer,
  threadsByID: ThreadReducer,
});
const store = compose(
  applyMiddleware(thunk),
  reduxReactRouter({createHistory: createHashHistory}),
  devTools(),
  persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/)),
)(createStore)(reducer);

export default store;
