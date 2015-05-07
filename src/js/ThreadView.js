/** @flow */

var Button = require('./Button');
var DependentStateMixin = require('./DependentStateMixin');
var KeyBinder = require('./KeyBinder');
var MessageStore = require('./MessageStore');
var MessageView = require('./MessageView');
var Observer = require('./Observer');
var PureRender = require('./PureRender');
var ThreadActions = require('./ThreadActions');
var ThreadStore = require('./ThreadStore');
var getUnsubscribeUrl = require('./getUnsubscribeUrl');
var sx = require('./styleSet');
var {Component, PropTypes} = require('react');
var {Observable} = require('rx');

@KeyBinder
@Observer
@PureRender
class ThreadView extends Component {
  static propTypes = {
    onGoToNextMessage: PropTypes.func.isRequired,
    params: PropTypes.object.isRequired,

    style: PropTypes.object,
  };

  observe(props, context) {
    if (!props.params.threadID) {
      return {};
    }

    const observeThread = ThreadStore.observeGetByID(
      {id: props.params.threadID}
    );

    const observeMessages = observeThread.flatMap(thread => {
      if (!thread) {
        return Observable.return(null);
      }

      return MessageStore.observeGetByIDs({ids: thread.messageIDs});
    });

    const observeUnsubscribeUrl = observeMessages.map(messages => {
      if (!messages) {
        return null;
      }

      const selectedMessage = messages.find(
        m => m.id === props.params.messageID
      );

      return getUnsubscribeUrl(selectedMessage);
    });

    return {
      thread: observeThread,
      messages: observeMessages,
      unsubscribeUrl: observeUnsubscribeUrl,
    };
  }

  componentWillMount() {
    this.bindKey('y', this._archive);
  }

  _archive = () => {
    this.props.onGoToNextMessage();
    ThreadActions.archive(this.props.params.threadID);
  };

  _moveToInbox = () => {
    ThreadActions.moveToInbox(this.props.params.threadID);
  };

  _markAsUnread = () => {
    ThreadActions.markAsUnread(this.props.params.threadID);
  };

  _star = () => {
    ThreadActions.star(this.props.params.threadID);
  };

  _unstar = () => {
    ThreadActions.unstar(this.props.params.threadID);
  };

  _unsubscribe = () => {
    window.open(this.data.unsubscribeUrl);
  };

  render(): ?ReactComponent {
    var messages = this.data.messages;
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
          {this.data.unsubscribeUrl ? (
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
    )
  }
}

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
