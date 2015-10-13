/** @flow */


import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import Radium from 'radium';
import {Component, PropTypes} from 'react';

import Button from './Button';
import KeyBinder from './KeyBinder';
import MessageView from './MessageView';
import PureRender from './PureRender';
import * as ThreadActions from './ThreadActions';
import getUnsubscribeUrl from './getUnsubscribeUrl';

@connect(
  state => ({
    params: state.router.params,
    messagesByID: state.messagesByID,
    threadsByID: state.threadsByID,
  }),
  dispatch => bindActionCreators({
    loadThread: ThreadActions.load,
    ...ThreadActions,
  }, dispatch),
  (stateProps, dispatchProps, ownProps) => {
    const thread = stateProps.threadsByID[ownProps.params.threadID];

    const messages = thread &&
      thread.messageIDs.map(messageID => stateProps.messagesByID[messageID]);

    const selectedMessage = messages && messages.find(
      message => message.id === ownProps.params.messageID
    );

    const unsubscribeUrl = selectedMessage && getUnsubscribeUrl(selectedMessage);

    return {
      ...dispatchProps,
      ...ownProps,
      thread,
      messages,
      unsubscribeUrl,
    };
  }
)
@KeyBinder
@PureRender
@Radium
class ThreadView extends Component {
  static propTypes = {
    onGoToNextMessage: PropTypes.func.isRequired,
    params: PropTypes.object.isRequired,

    style: PropTypes.object,
  };

  componentWillMount() {
    this._tryLoad(this.props);
    this.bindKey('y', this._archive);
  }

  componentWillReceiveProps(newProps) {
    this._tryLoad(newProps);
  }

  _tryLoad(props) {
    if (!props.params || !props.params.threadID) {
      return;
    }

    props.loadThread(props.params.threadID);
  }

  _archive = () => {
    this.props.onGoToNextMessage();
    this.props.archive(this.props.params.threadID);
  };

  _moveToInbox = () => {
    this.props.moveToInbox(this.props.params.threadID);
  };

  _markAsUnread = () => {
    this.props.markAsUnread(this.props.params.threadID);
  };

  _star = () => {
    this.props.star(this.props.params.threadID);
  };

  _unstar = () => {
    this.props.unstar(this.props.params.threadID);
  };

  _unsubscribe = () => {
    window.open(this.props.unsubscribeUrl);
  };

  render(): ?ReactComponent {
    const messages = this.props.messages;

    if (!messages) {
      return null;
    }

    const subject = messages[0].subject;
    const isStarred = messages.some(m => m.isStarred);
    const isInInbox = messages.some(m => m.isInInbox);

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
          {this.props.unsubscribeUrl ? (
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

const styles = {
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
