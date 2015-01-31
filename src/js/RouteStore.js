/** @flow */

var ActionType = require('./ActionType');
var BaseStore = require('./BaseStore');
var router = require('./router');

class RouteStore extends BaseStore {
  _messageID: ?string;
  _threadID: ?string;

  constructor() {
    super();
  }

  getMessageID(): string {
    return this._messageID;
  }

  getThreadID(): string {
    return this._threadID;
  }

  handleDispatch(action: Object) {
    switch (action.type) {
      case ActionType.App.ROUTE_CHANGED:
        this._messageID = action.state.params.messageID;
        this._threadID = action.state.params.threadID;
        this.emitChange();
        break;
    }
  }
}

module.exports = new RouteStore();
