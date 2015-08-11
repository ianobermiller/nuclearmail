/** @flow */


import {connect} from 'react-redux';
import Radium from 'radium';
import {Component, PropTypes} from 'react';
import {Observable} from 'rx-lite';

import Button from './Button';
import KeyBinder from './KeyBinder';
import MessageStore from './MessageStore';
import MessageView from './MessageView';
import Observer from './Observer';
import PureRender from './PureRender';
import ThreadActions from './ThreadActions';
import ThreadStore from './ThreadStore';
import getUnsubscribeUrl from './getUnsubscribeUrl';

@KeyBinder
@Observer
@PureRender
@Radium
class ThreadView extends Component {
  static propTypes = {
    onGoToNextMessage: PropTypes.func.isRequired,
    params: PropTypes.object.isRequired,

    style: PropTypes.object,
  };

  componentWillMount() {
    this.bindKey('y', this._archive);
  }

  observe(props, context) {
    if (!props.params.threadID) {
      return {};
    }

    const observeThread = ThreadStore.getByID(
      {id: props.params.threadID}
    );

    const observeMessages = observeThread.flatMap(thread => {
      if (!thread) {
        return Observable.return(null);
      }

      return MessageStore.getByIDs({ids: thread.messageIDs});
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
      <div style={[styles.root, this.props.style]}>
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
              isExpandedInitially={message.id === this.props.params.messageID}
              key={message.id}
              message={message}
            />
          ))}
        </div>
      </div>
    );
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
