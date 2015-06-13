/** @flow */

var API = require('./API');
var BlockMessageList = require('./BlockMessageList');
var Button = require('./Button');
var Colors = require('./Colors');
var KeyBinder = require('./KeyBinder');
var LabelStore = require('./LabelStore');
var LoginModal = require('./LoginModal');
var MessageActions = require('./MessageActions');
var MessageStore = require('./MessageStore');
var Nav = require('./Nav');
var Observer = require('./Observer');
var PureRender = require('./PureRender');
var Radium = require('radium');
var React = require('react/addons');
var Router = require('react-router');
var Scroller = require('./Scroller');
var SearchBox = require('./SearchBox');
var Spinner = require('./Spinner');
var ThreadActions = require('./ThreadActions');
var ThreadStore = require('./ThreadStore');
var _ = require('lodash');
var asap = require('asap');
var isOffline = require('./isOffline');
var {Component, PropTypes} = require('react');
var {Observable} = require('rx-lite');

var RouteHandler = Router.RouteHandler;

var PAGE_SIZE = 20;

var dummySubscription = {remove() {}};

@KeyBinder
@Observer
@PureRender
@Radium
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
      labels: LabelStore.getLabels(),
      threads: threadObservable,
      lastMessageInEachThread: threadObservable.flatMap(threads => {
        if (!threads) {
          return Observable.return(null);
        }

        var messageIDs = threads.items.map(
          thread => _.last(thread.messageIDs)
        );
        return MessageStore.getByIDs({ids: messageIDs});
      }),
    };
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
    var messages = this.data.lastMessageInEachThread;
    if (!messages) {
      return null;
    }

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
    var messages = this.data.lastMessageInEachThread;
    if (!messages) {
      return;
    }

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
          {this.data.threads &&
            this.data.lastMessageInEachThread ? (
            <Scroller
              hasMore={this.data.threads.hasMore}
              isScrollContainer={true}
              onRequestMoreItems={this._onRequestMoreItems}
              style={styles.messagesList}>
              <BlockMessageList
                labels={this.data.labels}
                messages={this.data.lastMessageInEachThread}
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
