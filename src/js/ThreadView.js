/** @flow */

var Button = require('./Button');
var KeybindingMixin = require('./KeybindingMixin');
var MessageStore = require('./MessageStore');
var MessageView = require('./MessageView');
var ThreadActions = require('./ThreadActions');
var React = require('react');
var DependentStateMixin = require('./DependentStateMixin');
var RouteStore = require('./RouteStore');
var ThreadStore = require('./ThreadStore');
var sx = require('./styleSet');

var PropTypes = React.PropTypes;
var PureRenderMixin = React.addons.PureRenderMixin;
var _ = require('lodash');

var ThreadView = React.createClass({
  mixins: [
    PureRenderMixin,
    KeybindingMixin,
    DependentStateMixin({
      threadID: {
        method: RouteStore.getThreadID,
      },
      thread: {
        method: ThreadStore.getByID,
        getOptions: (props, state) => ({
          id: state.threadID,
        }),
        shouldFetch: options => !!options.id
      },
      selectedMessageID: {
        method: RouteStore.getMessageID,
      },
      messages: {
        method: MessageStore.getByIDs,
        getOptions: (props, state) => ({
          ids: state.thread && state.thread.messageIDs
        }),
        shouldFetch: options => !!options.ids,
      },
      unsubscribeUrl: {
        method: getUnsubscribeUrl,
        getOptions: (props, state) => ({
          messages: state.messages,
          selectedMessageID: state.selectedMessageID,
        }),
        shouldFetch: options => options.messages && options.selectedMessageID
      }
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

  _unsubscribe() {
    window.open(this.state.unsubscribeUrl);
  },

  render(): ?Object {
    var messages = this.state.messages;
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
          {this.state.unsubscribeUrl ? (
            <li style={styles.actionBarItem}>
              <Button onClick={this._unsubscribe}>Unsubscribe</Button>
            </li>
          ) : null}
        </ul>
        <div style={styles.messages}>
          {messages.map(message => (
            <MessageView
              key={message.id}
              isExpandedInitially={message.id === this.state.selectedMessageID}
              message={message}
            />
          ))}
        </div>
      </div>
    );
  }
});

function getUnsubscribeUrl({messages, selectedMessageID}) {
  var message = messages.find(
    m => m.id === selectedMessageID
  );

  if (!message) {
    return null;
  }

  var body = message.body['text/html'] || message.body['text/plain'];
  var bodyLower = body.toLowerCase();

  var match = bodyLower.match(/unsubscribe/) || bodyLower.match(/preferences/);
  if (!match) {
    return null;
  }
  var unsubscrieIndices = [
    match.index,
    match.index + 11
  ];

  var urlRegex = /href=['"]([^'"]+)['"]/g;
  var urls = [];
  while (match = urlRegex.exec(bodyLower)) {
    var url = match[1];
    var index = bodyLower.indexOf("</a>", match.index);
    var urlIndices = [
      match.index,
      bodyLower.indexOf("</a>", match.index),
      bodyLower.lastIndexOf("<a ", match.index)
    ];

    var score = _.min(_.flatten(
      urlIndices.map(urlIndex =>
        unsubscrieIndices.map(unsubIndex =>
          Math.abs(urlIndex - unsubIndex)
        )
      )
    ));

    urls.push({
      url: body.substring(match.index + 6, match.index + 6 + url.length),
      score
    });
  }

  var closestUrl = _.min(urls, url => url.score);

  if (closestUrl.score > 100) {
    return null;
  }

  return closestUrl.url;
}

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
