/** @flow */

import Radium from 'radium';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {RouteHandler} from 'react-router';
import _ from 'lodash';
import asap from 'asap';
import {Component, PropTypes} from 'react';

import BlockMessageList from './BlockMessageList';
import Button from './Button';
import Colors from './Colors';
import KeyBinder from './KeyBinder';
import * as LabelActions from './LabelActions';
import LoginModal from './LoginModal';
import MessageActions from './MessageActions';
import Nav from './Nav';
import PureRender from './PureRender';
import Scroller from './Scroller';
import SearchBox from './SearchBox';
import Spinner from './Spinner';
import * as ThreadActions from './ThreadActions';

const PAGE_SIZE = 20;

const dummySubscription = {remove() {}};

@connect(
  state => ({
    isAuthorized: state.authorization.isAuthorized,
    isAuthorizing: state.authorization.isAuthorizing,
    isLoading: state.isLoading,
    labels: state.labels,
    messagesByID: state.messagesByID,
    threadListByQuery: state.threadListByQuery,
    threadsByID: state.threadsByID,
  }),
  dispatch => bindActionCreators({
    loadLabels: LabelActions.loadAll,
    loadThreadList: ThreadActions.loadList,
    refresh: ThreadActions.refresh,
    markAsRead: ThreadActions.markAsRead,
  }, dispatch),
)
@KeyBinder
@PureRender
@Radium
class App extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
  };

  state = {
    maxResultCount: PAGE_SIZE,
    query: 'in:inbox',
    queryProgress: 'in:inbox',
  };

  _subscriptions = [dummySubscription];

  componentWillMount() {
    this._tryLoad(this.state);
  }

  componentWillUpdate(nextProps, nextState) {
    this._tryLoad(nextState);
  }

  componentWillRecieveProps(nextProps) {
    this._tryLoad(this.state);
  }

  componentDidMount() {
    this.bindKey('k', this._selectNextMessage);
    this.bindKey('j', this._selectPreviousMessage);
  }

  _tryLoad(state) {
    this.props.loadThreadList(state.query, state.maxResultCount);
  }

  _onRequestMoreItems = () => {
    this.setState({maxResultCount: this.state.maxResultCount + PAGE_SIZE});
  };

  _onMessageSelected = (message: ?Object) => {
    if (message && message.isUnread) {
      this.props.markAsRead(message.threadID);
    }
    MessageActions.select(message);
  };

  _onQueryChange = (query: string) => {
    this.setState({
      queryProgress: query,
      maxResultCount: PAGE_SIZE,
    });
  };

  _onQuerySubmit = (query: string) => {
    this.setState({
      query: query,
      queryProgress: query,
      maxResultCount: PAGE_SIZE,
    });
  }

  _selectNextMessage = () => {
    this._onMessageSelected(this._getNextMessage());
  };

  _getNextMessage(): ?Object {
    const messages = this._getMessages();
    if (!messages) {
      return null;
    }

    const selectedMessageIndex = this.props.params.messageID &&
      messages.findIndex(
        msg => msg.id === this.props.params.messageID
      );

    if (!this.props.params.messageID) {
      return messages[0];
    } else if (selectedMessageIndex < 0 || selectedMessageIndex === messages.length) {
      return null;
    } else {
      return messages[selectedMessageIndex + 1];
    }
  }

  _selectPreviousMessage = () => {
    const messages = this._getMessages();
    if (!messages) {
      return null;
    }

    const selectedMessageIndex = messages.findIndex(
      msg => msg.id === this.props.params.messageID
    );

    if (!this.props.params.messageID) {
      this._onMessageSelected(messages[0]);
    } else if (selectedMessageIndex < 0 || selectedMessageIndex === 0) {
      this._onMessageSelected(null);
    } else {
      this._onMessageSelected(messages[selectedMessageIndex - 1]);
    }
  }

  _onRefresh = () => {
    this.props.refresh();
  }

  _onLogoClick = () => {
    window.location.reload();
  }

  _getMessages = () => {
    const {messagesByID, threadsByID, threadListByQuery} = this.props;
    const threadList = threadListByQuery[this.state.query];
    const threads = threadList ?
      threadList.threadIDs.map(threadID => threadsByID[threadID]) :
      [];
    return threads && threads.map(
      thread => messagesByID[_.last(thread.messageIDs)]
    );
  }

  render(): any {
    const {threadListByQuery} = this.props;
    const threadList = threadListByQuery[this.state.query];
    const hasMoreThreads = threadList ? !!threadList.nextPageToken : true;
    const loadedThreadCount = threadList ? threadList.threadIDs.length : 0;
    const messages = this._getMessages();

    return (
      <div style={styles.app}>
        {this.props.isLoading ? <Spinner /> : null}
        <div style={styles.header}>
          <span onClick={this._onLogoClick} style={styles.logo}>
            ☢
            <span style={styles.logoName}>{' '}NUCLEARMAIL</span>
          </span>
          <SearchBox
            onQueryChange={this._onQueryChange}
            onQuerySubmit={this._onQuerySubmit}
            query={this.state.queryProgress}
            style={styles.search}
          />
          <Button onClick={this._onRefresh} style={styles.refresh}>
          ⟳
          </Button>
        </div>
        <Nav
          onQueryChanged={this._onQuerySubmit}
          query={this.state.query}
        />
        <div style={styles.messages}>
          {messages ? (
            <Scroller
              hasMore={hasMoreThreads}
              isScrollContainer={true}
              onRequestMoreItems={this._onRequestMoreItems}
              style={styles.messagesList}>
              <BlockMessageList
                labels={this.props.labels}
                messages={messages}
                onMessageSelected={this._onMessageSelected}
                selectedMessageID={this.props.params.messageID}
              />
              {hasMoreThreads ? (
                <div style={styles.messageLoading}>
                  You{"'"}ve seen {loadedThreadCount}.
                  {loadedThreadCount >= 100 ? (
                    ' ' + _.sample(pagingMessages)
                  ) : null}
                  {' '}Loading more...
                </div>
              ) : null}
            </Scroller>
          ) : (
            <div style={styles.messagesList} />
          )}
          <div style={styles.threadView}>
            <RouteHandler
              onGoToNextMessage={this._selectNextMessage}
              params={this.props.params}
            />
          </div>
        </div>
        {(!this.props.isAuthorizing && !this.props.isAuthorized) ? (
          <LoginModal />
        ) : null}
      </div>
    );
  }
}

const styles = {
  app: {
    paddingTop: '20px',
  },

  header: {
    display: 'flex',
  },

  logo: {
    color: Colors.accent,
    fontSize: '24px',
    fontWeight: 'bold',
    lineHeight: '32px',
    marginLeft: '12px',
  },

  logoName: {
    marginRight: '12px',
    '@media (max-width: 800px)': {
      display: 'none',
    },
  },

  search: {
    marginLeft: '12px',
  },

  refresh: {
    marginLeft: '12px',
  },

  messages: {
    bottom: 0,
    display: 'flex',
    left: 0,
    position: 'absolute',
    right: 0,
    top: '104px',
  },

  messagesList: {
    flex: 1,
    height: '100%',
    minWidth: '300px',
    maxWidth: '400px',
  },

  threadView: {
    flex: 2,
    height: '100%',
  },

  messageLoading: {
    textAlign: 'center',
    padding: '20px',
  },
};

const pagingMessages = [
  'Still going?',
  'Now you\'re just getting greedy.',
  '\u266b I still haven\'t found what I\'m lookin\' for. \u266b',
  'I could go on forever.',
  'Perhaps you should narrow the search term?',
  'Look at you go!',
  '\u266b This is the song that never ends \u266b',
  '\u266b Scrollin, scrollin, scrollin through the emails \u266b',
  'Really?',
  'Give up, you\'ll never find it now.',
  'I know it must be here somewhere.',
  'You can do it!',
  'Eventually you\'ll just give up.',
  'Dig dig dig!'
];

module.exports = App;
