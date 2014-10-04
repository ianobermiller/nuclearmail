/** @jsx React.DOM */

var LabelAPI = require('./LabelAPI.js');
var BaseStore = require('./BaseStore.js');

class LabelStore extends BaseStore {
  constructor() {
    super();

    this._labels = null;
  }

  getLabels() {
    if (this._labels) {
      return Promise.resolve(this._labesl);
    }

    return LabelAPI.list().then(labels => {
      this._labels = labels;
      return labels;
    });
  }
}

module.exports = new LabelStore();
