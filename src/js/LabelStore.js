/** @flow */

var LabelAPI = require('./LabelAPI');
var BaseStore = require('./BaseStore');

class LabelStore extends BaseStore {
  _labels: ?Array<Object>;

  constructor() {
    super();

    this._labels = null;
  }

  getLabels() {
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
