/** @jsx React.DOM */

var API = require('./API.js');
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

    return API.listLabels().then(labels => {
      this._labels = labels;
      return labels;
    });
  }
}

module.exports = new LabelStore();
