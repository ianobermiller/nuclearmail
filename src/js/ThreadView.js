/** @jsx React.DOM */

var KeybindingMixin = require('./KeybindingMixin');
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
    KeybindingMixin,
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

  componentWillMount() {
    this.bindKey('y', this._archive);
  },

  _archive() {
    ThreadActions.archive(this.props.thread.id);
    this.props.onThreadClosed();
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

    return (
      <div>
        <ul className={Classes.actionBar}>
          <li className={Classes.actionBarItem}>
            <button onClick={this._archive}>Archive</button>
          </li>
          <li className={Classes.actionBarItem}>
            <button onClick={this._markAsUnread}>Unread</button>
          </li>
          {isStarred ? (
            <li className={Classes.actionBarItem}>
              <button onClick={this._unstar}>Unstar</button>
            </li>
          ) : (
            <li className={Classes.actionBarItem}>
              <button onClick={this._star}>Star</button>
            </li>
          )}
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
