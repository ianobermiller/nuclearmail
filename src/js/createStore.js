var BaseStore = require('./BaseStore');

function createStore(reducer) {
  var storeClass = class extends BaseStore {
    handleDispatch(action) {
      const newState = reducer(state, action);
      if (newState !== this._state) {
        this._state = newState;
        this.emitChange();
      }
    }

    getState() {
      return this.__wrapAsObservable(this._getLabelsSync, {});
    }
  };

  return new storeClass();
}

module.exports = createStore;
