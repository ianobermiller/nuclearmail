/** @flow */

var LabelAPI = require('./LabelAPI');
var BaseStore = require('./BaseStore');
var isOffline = require('./isOffline');

class LabelStore extends BaseStore {
  _labels: ?Array<Object>;

  constructor() {
    super();

    this._labels = isOffline() ? [] : undefined;
  }

  observeGetLabels(): Observable<?Array<Object>> {
    return this.__wrapAsObservable(this.getLabels, {});
  }

  getLabels(): ?Array<Object> {
    if (this._labels !== undefined) {
      return this._labels;
    }

    // Prevent double fetcing
    this._labels = null;

    LabelAPI.list().then(labels => {
      console.log('labels', labels)
      this._labels = labels;
      this.emitChange();
    });

    return null;
  }
}

module.exports = new LabelStore();
