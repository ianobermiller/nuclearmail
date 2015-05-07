/** @flow */

var LabelAPI = require('./LabelAPI');
var BaseStore = require('./BaseStore');
var isOffline = require('./isOffline');

class LabelStore extends BaseStore {
  _labels: ?Array<Object>;

  constructor() {
    super();

    this._labels = isOffline() ? [] : null;
  }

  observeGetLabels(): Observable<?Array<Object>> {
    return this.__wrapAsObservable(this.getLabels, {});
  }

  getLabels(): ?Array<Object> {
    if (this._labels) {
      return this._labels;
    }

    LabelAPI.list().then(labels => {
      this._labels = labels;
      this.emitChange();
    });

    return null;
  }
}

module.exports = new LabelStore();
