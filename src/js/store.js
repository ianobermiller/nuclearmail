import {applyMiddleware, combineReducers, createStore} from 'redux';
import thunk from 'redux-thunk';

import LabelReducer from './LabelReducer';
import MessageReducer from './MessageReducer';
import ThreadReducer from './ThreadReducer';
import ThreadListReducer from './ThreadListReducer';

const reducer = combineReducers({
  labels: LabelReducer,
  messagesByID: MessageReducer,
  threadsByID: ThreadReducer,
  threadListByQuery: ThreadListReducer,
});
const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
const store = createStoreWithMiddleware(reducer);

export default store;
