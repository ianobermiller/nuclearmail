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
      return Promise.resolve(this._labels);
    }

    return LabelAPI.list().then(labels => {
      this._labels = labels;
      return labels;
    });
  }
}

module.exports = new LabelStore();
