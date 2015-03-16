/** @flow */

var Button = require('./Button');
var KeybindingMixin = require('./KeybindingMixin');
var MessageStore = require('./MessageStore');
var MessageView = require('./MessageView');
var ThreadActions = require('./ThreadActions');
var React = require('react/addons');
var DependentStateMixin = require('./DependentStateMixin');
var ThreadStore = require('./ThreadStore');
var getUnsubscribeUrl = require('./getUnsubscribeUrl');
var sx = require('./styleSet');

var PropTypes = React.PropTypes;
var PureRenderMixin = React.addons.PureRenderMixin;

var ThreadView = React.createClass({
  propTypes: {
    onGoToNextMessage: PropTypes.func.isRequired,
    params: PropTypes.object.isRequired,
  },

  mixins: [
    PureRenderMixin,
    KeybindingMixin,
    DependentStateMixin({
      thread: {
        method: ThreadStore.getByID,
        getOptions: (props) => ({
          id: props.params.threadID,
        }),
        shouldFetch: options => !!options.id
      },
      messages: {
        method: MessageStore.getByIDs,
        getOptions: (props, state) => ({
          ids: state.thread && state.thread.messageIDs
        }),
        shouldFetch: options => !!options.ids,
      },
      unsubscribeUrl: {
        method: (options) => {
          var message = options.messages.find(
            m => m.id === options.selectedMessageID
          );
          return getUnsubscribeUrl(message);
        },
        getOptions: (props, state) => ({
          messages: state.messages,
          selectedMessageID: props.params.messageID,
        }),
        shouldFetch: options => options.messages && options.selectedMessageID
      }
    }),
  ],

  componentWillMount() {
    this.bindKey('y', this._archive);
  },

  _archive() {
    this.props.onGoToNextMessage();
    ThreadActions.archive(this.props.params.threadID);
  },

  _moveToInbox() {
    ThreadActions.moveToInbox(this.props.params.threadID);
  },

  _markAsUnread() {
    ThreadActions.markAsUnread(this.props.params.threadID);
  },

  _star() {
    ThreadActions.star(this.props.params.threadID);
  },

  _unstar() {
    ThreadActions.unstar(this.props.params.threadID);
  },

  _unsubscribe() {
    window.open(this.state.unsubscribeUrl);
  },

  render(): ?Object {
    var messages = this.state.messages;
    if (!messages) {
      return null;
    }

    var subject = messages[0].subject;
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
          {this.state.unsubscribeUrl ? (
            <li style={styles.actionBarItem}>
              <Button onClick={this._unsubscribe}>Unsubscribe</Button>
            </li>
          ) : null}
        </ul>
        <div style={styles.subject}>
          {subject}
        </div>
        <div style={styles.messages}>
          {messages.map(message => (
            <MessageView
              key={message.id}
              isExpandedInitially={message.id === this.props.params.messageID}
              message={message}
            />
          ))}
        </div>
      </div>
    );
  }
});

var styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },

  actionBar: {
    margin: '0 12px'
  },

  actionBarItem: {
    display: 'inline-block',
    margin: '0 12px 12px 0',
  },

  subject: {
    fontWeight: 'bold',
    margin: '0 12px 12px 12px',
  },

  messages: {
    flex: 1,
    overflow: 'auto',
    paddingBottom: '12px',
  },
};

module.exports = ThreadView;
