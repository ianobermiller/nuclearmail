/** @jsx React.DOM */

var Button = require('./Button');
var KeybindingMixin = require('./KeybindingMixin');
var MessageStore = require('./MessageStore');
var MessageView = require('./MessageView');
var ThreadActions = require('./ThreadActions');
var React = require('react');
var StoreToStateMixin = require('./StoreToStateMixin');
var sx = require('./StyleSet');

var PropTypes = React.PropTypes;
var PureRenderMixin = React.addons.PureRenderMixin;
var _ = require('lodash');

var ThreadView = React.createClass({
  propTypes: {
    thread: PropTypes.object.isRequired,
    onThreadClosed: PropTypes.func.isRequired,

    selectedMessageID: PropTypes.string,
  },

  mixins: [
    PureRenderMixin,
    KeybindingMixin,
    StoreToStateMixin({
      messages: {
        method: MessageStore.getByIDs,
        getOptions: (props, state) => ({
          ids: props.thread.messageIDs
        }),
        shouldFetch: options => !!options.ids,
      },
    }),
  ],

  componentWillMount() {
    this.bindKey('y', this._archive);
  },

  _archive() {
    ThreadActions.archive(this.props.thread.id);
    this.props.onThreadClosed();
  },

  _moveToInbox() {
    ThreadActions.moveToInbox(this.props.thread.id);
  },

  _markAsUnread() {
    ThreadActions.markAsUnread(this.props.thread.id);
  },

  _star() {
    ThreadActions.star(this.props.thread.id);
  },

  _unstar() {
    ThreadActions.unstar(this.props.thread.id);
  },

  render() /*object*/ {
    var messages = this.state.messages.result;
    if (!messages) {
      return null;
    }

    var isStarred = messages.some(m => m.isStarred);
    var isInInbox = messages.some(m => m.isInInbox);

    return (
      <div style={sx(styles.root, this.props.style)}>
        <ul style={styles.actionBar}>
          {isInInbox ? (
            <li style={styles.actionBarItem}>
              <Button onClick={this._archive}>Archive</Button>
            </li>
          ) : (
            <li style={styles.actionBarItem}>
              <Button onClick={this._moveToInbox}>To Inbox</Button>
            </li>
          )}
          <li style={styles.actionBarItem}>
            <Button onClick={this._markAsUnread}>Unread</Button>
          </li>
          {isStarred ? (
            <li style={styles.actionBarItem}>
              <Button onClick={this._unstar}>Unstar</Button>
            </li>
          ) : (
            <li style={styles.actionBarItem}>
              <Button onClick={this._star}>Star</Button>
            </li>
          )}
        </ul>
        <div style={styles.messages}>
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

var styles = {
  root: {
    height: '100%',
  },

  actionBar: {
    padding: '0 12px 12px 12px'
  },

  actionBarItem: {
    display: 'inline-block',
    marginRight: '12px',
  },

  messages: {
    boxSizing: 'border-box',
    height: 'calc(100% - 57px)',
    overflow: 'auto',
    paddingBottom: '12px',
  },
};

module.exports = ThreadView;
