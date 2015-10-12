import {applyMiddleware, combineReducers, createStore} from 'redux';
import thunk from 'redux-thunk';

import AuthorizationReducer from './AuthorizationReducer';
import LabelReducer from './LabelReducer';
import LoadingReducer from './LoadingReducer';
import MessageReducer from './MessageReducer';
import ThreadReducer from './ThreadReducer';
import ThreadListReducer from './ThreadListReducer';

const reducer = combineReducers({
  authorization: AuthorizationReducer,
  isLoading: LoadingReducer,
  labels: LabelReducer,
  messagesByID: MessageReducer,
  threadListByQuery: ThreadListReducer,
  threadsByID: ThreadReducer,
});
const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
const store = createStoreWithMiddleware(reducer);

export default store;
