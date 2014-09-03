/** @jsx React.DOM */

var MessageStore = require('./MessageStore');
var MessageView = require('./MessageView');
var ThreadActions = require('./ThreadActions');
var ThreadView = require('./ThreadView');
var React = require('react');
var StoreToStateMixin = require('./StoreToStateMixin');

var PropTypes = React.PropTypes;
var PureRenderMixin = React.addons.PureRenderMixin;
var _ = require('lodash');
var cx = React.addons.classSet;

var ThreadView = React.createClass({
  propTypes: {
    thread: PropTypes.object.isRequired,

    selectedMessageID: PropTypes.string,
  },

  mixins: [
    PureRenderMixin,
    StoreToStateMixin({
      messages: {
        method: MessageStore.getByIDs,
        getOptions: (props, state) => ({
          ids: props.thread.messageIDs
        }),
        shouldFetch: options => !!options.ids,
      },
    })
  ],

  _markAsUnread() {
    ThreadActions.markAsUnread(this.props.thread.id);
  },

  render() /*object*/ {
    var messages = this.state.messages.result;
    if (!messages) {
      return null;
    }

    return (
      <div className="ThreadView">
        <ul className="ThreadView_actionbar">
          <li className="ThreadView_actionbar_item">
            <button>Archive</button>
          </li>
          <li className="ThreadView_actionbar_item">
            <button onClick={this._markAsUnread}>Unread</button>
          </li>
        </ul>
        <div className="ThreadView_messages">
          {messages.map(message => (
            <MessageView
              key={message.id}
              message={message}
              isExpandedInitially={message.id === this.props.selectedMessageID}
            />
          ))}
        </div>
      </div>
    );
  }
});

module.exports = ThreadView;
