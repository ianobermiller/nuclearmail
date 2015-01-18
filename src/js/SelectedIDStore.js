/** @flow */

var ActionType = require('./ActionType');
var BaseStore = require('./BaseStore');

class SelectedIDStore extends BaseStore {
  _selectedIDByType: {[type: string]: ?string};

  constructor() {
    super();

    this._selectedIDByType = {};
  }

  get({type}: {type: string}): Promise<?string> {
    return Promise.resolve(this._selectedIDByType[type] || null);
  }

  handleDispatch(action: Object) {
    switch (action.type) {
      case ActionType.Message.SELECT:
        this._selectedIDByType['message'] = action.message && action.message.id;
        this._selectedIDByType['thread'] = action.message && action.message.threadID;
        this.emitChange();
        break;
    }
  }
}

module.exports = new SelectedIDStore();
