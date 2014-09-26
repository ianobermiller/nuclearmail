/** @jsx React.DOM */

var MessageStore = require('./MessageStore');
var MessageView = require('./MessageView');
var ThreadActions = require('./ThreadActions');
var ThreadView = require('./ThreadView');
var React = require('react');
var StoreToStateMixin = require('./StoreToStateMixin');
var StyleSet = require('./StyleSet');
var Styles = require('./Styles');

var PropTypes = React.PropTypes;
var PureRenderMixin = React.addons.PureRenderMixin;
var _ = require('lodash');
var cx = React.addons.classSet;

var ThreadView = React.createClass({
  propTypes: {
    thread: PropTypes.object.isRequired,
    onThreadClosed: PropTypes.func.isRequired,

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

  _archive() {
    ThreadActions.archive(this.props.thread.id);
    this.props.onThreadClosed();
  },

  _markAsUnread() {
    ThreadActions.markAsUnread(this.props.thread.id);
  },

  render() /*object*/ {
    var messages = this.state.messages.result;
    if (!messages) {
      return null;
    }

    return (
      <div>
        <ul className={Classes.actionBar}>
          <li className={Classes.actionBarItem}>
            <button onClick={this._archive}>Archive</button>
          </li>
          <li className={Classes.actionBarItem}>
            <button onClick={this._markAsUnread}>Unread</button>
          </li>
        </ul>
        <div className={Classes.messages}>
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

var {Classes, Styles} = StyleSet('ThreadView', {
  actionBar: [{
    background: 'white',
    borderBottom: '1px solid #ccc',
    padding: '12px',
  }, Styles.clearfix],

  actionBarItem: {
    float: 'left',
    marginRight: '12px',
  },

  messages: {
    boxSizing: 'border-box',
    height: 'calc(100% - 57px)',
    overflow: 'auto',
    paddingBottom: '12px',
  },
});

module.exports = ThreadView;
