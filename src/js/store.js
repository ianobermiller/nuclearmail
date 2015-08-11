import {applyMiddleware, combineReducers, createStore} from 'redux';
import thunk from 'redux-thunk';

import LabelReducer from './LabelReducer';
import MessageReducer from './MessageReducer';

const reducer = combineReducers({
  labels: LabelReducer,
  messagesByID: MessageReducer,
});
const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
const store = createStoreWithMiddleware(reducer);

export default store;
