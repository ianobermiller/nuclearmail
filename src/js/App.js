/** @flow */

import Radium from 'radium';
import {connect} from 'react-redux';
import {RouteHandler} from 'react-router';
import _ from 'lodash';
import asap from 'asap';
import {Component, PropTypes} from 'react';
import {Observable} from 'rx-lite';

import API from './API';
import BlockMessageList from './BlockMessageList';
import Button from './Button';
import Colors from './Colors';
import KeyBinder from './KeyBinder';
import * as LabelActions from './LabelActions';
import LoginModal from './LoginModal';
import MessageActions from './MessageActions';
import Nav from './Nav';
import Observer from './Observer';
import PureRender from './PureRender';
import Scroller from './Scroller';
import SearchBox from './SearchBox';
import Spinner from './Spinner';
import ThreadActions from './ThreadActions';
import ThreadStore from './ThreadStore';
import isOffline from './isOffline';

var PAGE_SIZE = 20;

var dummySubscription = {remove() {}};

@connect(
  state => ({
    labels: state.labels,
    messagesByID: state.messagesByID,
  }),
  dispatch => ({loadLabels: () => dispatch(LabelActions.loadAll())}),
)
@KeyBinder
@PureRender
@Radium
@Observer
class App extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
  };

  state = {
    isAuthorizing: true,
    isAuthorized: false,
    isLoading: !isOffline(),
    maxResultCount: PAGE_SIZE,
    query: 'in:inbox',
    queryProgress: 'in:inbox',
  };

  _subscriptions = [dummySubscription];

  observe() {
    var threadObservable = ThreadStore.list({
      query: this.state.query,
      maxResultCount: this.state.maxResultCount,
    });
    return {
      threads: threadObservable,
      lastMessageIDInEachThread: threadObservable.flatMap(threads => {
        if (!threads) {
          return Observable.return(null);
        }

        var messageIDs = threads.items.map(
          thread => _.last(thread.messageIDs)
        );
        return Observable.return(messageIDs);
      }),
    };
  }

  componentWillMount() {
    this.props.loadLabels();
  }

  componentDidMount() {
    this._subscriptions = [];
    this._subscriptions.push(API.subscribe('start', () => {
      if (!this.state.isLoading) {
        asap(() => this.setState({isLoading: true}));
      }
    }));
    this._subscriptions.push(API.subscribe('allStopped', () => {
      // run outside of this context in case the api call was synchronous
      asap(() => this.setState({isLoading: false}));
    }));
    this._subscriptions.push(API.subscribe('isAuthorized', isAuthorized => {
      this.setState({isAuthorizing: false, isAuthorized});
    }));

    this.bindKey('k', this._selectNextMessage);
    this.bindKey('j', this._selectPreviousMessage);
  }

  componentWillUnmount() {
    this._subscriptions.forEach(s => s.remove());
  }

  _onRequestMoreItems = () => {
    this.setState({maxResultCount: this.state.maxResultCount + PAGE_SIZE});
  };

  _onMessageSelected = (message: ?Object) => {
    if (message && message.isUnread) {
      ThreadActions.markAsRead(message.threadID);
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
    var messageIDs = this.data.lastMessageIDInEachThread;
    if (!messageIDs) {
      return null;
    }

    var messages = this.data.lastMessageIDInEachThread.map(
      messageID => this.props.messagesByID[messageID]
    );

    var selectedMessageIndex = this.props.params.messageID &&
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
    var messageIDs = this.data.lastMessageIDInEachThread;
    if (!messageIDs) {
      return null;
    }

    var messages = this.data.lastMessageIDInEachThread.map(
      messageID => this.props.messagesByID[messageID]
    );

    var selectedMessageIndex = messages.findIndex(
      msg => msg.id === this.props.params.messageID
    );

    if (!this.props.params.messageID) {
      this._onMessageSelected(messages[0]);
    } else if (selectedMessageIndex < 0 || selectedMessageIndex === 0) {
      this._onMessageSelected(null);
    } else {
      this._onMessageSelected(messages[selectedMessageIndex - 1]);
    }
  };

  _onRefresh = () => {
    ThreadActions.refresh();
  };

  _onLogoClick = () => {
    window.location.reload();
  };

  render(): any {
    var messages = this.data.lastMessageIDInEachThread &&
      this.data.lastMessageIDInEachThread.map(
        messageID => this.props.messagesByID[messageID]
      );
    return (
      <div style={styles.app}>
        {this.state.isLoading ? <Spinner /> : null}
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
          {this.data.threads && messages ? (
            <Scroller
              hasMore={this.data.threads.hasMore}
              isScrollContainer={true}
              onRequestMoreItems={this._onRequestMoreItems}
              style={styles.messagesList}>
              <BlockMessageList
                labels={this.props.labels}
                messages={messages}
                onMessageSelected={this._onMessageSelected}
                selectedMessageID={this.props.params.messageID}
              />
              {this.data.threads.hasMore ? (
                <div style={styles.messageLoading}>
                  You{"'"}ve seen {this.data.threads.items.length}.
                  {this.data.threads.items.length >= 100 ? (
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
        {(!this.state.isAuthorizing && !this.state.isAuthorized) ? (
          <LoginModal />
        ) : null}
      </div>
    );
  }
}

var styles = {
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

var pagingMessages = [
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
