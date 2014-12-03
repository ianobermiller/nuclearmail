/** @jsx React.DOM */

require('es6-shim');

var API = require('./API');
var BlockMessageList = require('./BlockMessageList');
var Button = require('./Button');
var Colors = require('./Colors');
var InteractiveStyleMixin = require('./InteractiveStyleMixin');
var LabelStore = require('./LabelStore');
var LoginModal = require('./LoginModal');
var MessageStore = require('./MessageStore');
var Nav = require('./Nav');
var React = require('react');
var Scroller = require('./Scroller');
var SearchBox = require('./SearchBox');
var StoreToStateMixin = require('./StoreToStateMixin');
var ThreadActions = require('./ThreadActions');
var ThreadStore = require('./ThreadStore');
var ThreadView = require('./ThreadView');
var _ = require('lodash');
var asap = require('asap');
var moment = require('moment');

var PureRenderMixin = React.addons.PureRenderMixin;

var PAGE_SIZE = 20;

moment.locale('en', {
  calendar : {
    lastDay : 'MMM D',
    sameDay : 'LT',
    nextDay : 'MMM D',
    lastWeek : 'MMM D',
    nextWeek : 'MMM D',
    sameElse : 'L'
  }
});

// Expose React for the dev tools
window.React = React;

var App = React.createClass({
  mixins: [
    PureRenderMixin,
    StoreToStateMixin({
      labels: {
        method: LabelStore.getLabels,
      },
      threads: {
        method: ThreadStore.list,
        getOptions: (props, state) => ({
          query: state.query,
          maxResultCount: state.maxResultCount,
        }),
      },
      lastMessages: {
        method: MessageStore.getByIDs,
        getOptions: (props, state) => {
          var messageIDs = state.threads.result && state.threads.result.items.map(
            thread => _.last(thread.messageIDs)
          );
          return {ids: messageIDs};
        },
        shouldFetch: options => !!options.ids,
      },
    }),
    InteractiveStyleMixin({
      logo: ['matchMedia'],
    }),
  ],

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
  },

  componentWillUnmount() {
    this._subscriptions.forEach(s => s.remove());
  },

  getInitialState() {
    return {
      isAuthorizing: true,
      isAuthorized: false,
      isLoading: true,
      maxResultCount: PAGE_SIZE,
      query: 'in:inbox',
      queryProgress: 'in:inbox',
      selectedMessageID: null,
    };
  },

  _onRequestMoreItems() {
    this.setState({maxResultCount: this.state.maxResultCount + PAGE_SIZE});
  },

  _onMessageSelected(message) {
    ThreadActions.markAsRead(message.threadID);

    this.setState({
      selectedMessageID: message.id,
      selectedThreadID: message.threadID,
    });
  },

  _onQueryChange(query) {
    this.setState({
      queryProgress: query,
      maxResultCount: PAGE_SIZE,
    });
  },

  _onQuerySubmit(query) {
    this.setState({
      query: query,
      queryProgress: query,
      maxResultCount: PAGE_SIZE,
    });
  },

  _onThreadClosed() {
    var messages = this.state.lastMessages.result;

    var selectedMessageIndex = messages.findIndex(
      msg => msg.id === this.state.selectedMessageID
    );

    if (selectedMessageIndex < 0 || selectedMessageIndex === messages.length) {
      this.setState({selectedMessageID: null, selectedThreadID: null});
    } else {
      this._onMessageSelected(messages[selectedMessageIndex + 1]);
    }
  },

  _onRefresh() {
    ThreadActions.refresh();
  },

  _onLogoClick() {
    window.location.reload();
  },

  render() {
    var selectedThread = this.state.selectedThreadID && _.find(
      this.state.threads.result.items,
      {id: this.state.selectedThreadID}
    );
    return (
      <div style={styles.app}>
        {this.state.isLoading && <div style={styles.spinner} />}
        <div style={styles.header}>
          <span style={styles.logo} onClick={this._onLogoClick}>
            ☢
            {!this.interactions.logo.matchMedia('(max-width: 800px)') ? (
              <span style={styles.logoName}>{' '}NUCLEARMAIL</span>
            ) : null}
          </span>
          <SearchBox
            style={styles.search}
            query={this.state.queryProgress}
            onQueryChange={this._onQueryChange}
            onQuerySubmit={this._onQuerySubmit}
          />
          <Button style={styles.refresh} onClick={this._onRefresh}>
          ⟳
          </Button>
        </div>
        <Nav
          onQueryChanged={this._onQuerySubmit}
          query={this.state.query}
        />
        <div style={styles.messages}>
          {this.state.lastMessages.result ? (
            <Scroller
              style={styles.messagesList}
              hasMore={this.state.threads.result.hasMore}
              isScrollContainer={true}
              onRequestMoreItems={this._onRequestMoreItems}>
              <BlockMessageList
                labels={this.state.labels.result}
                messages={this.state.lastMessages.result}
                onMessageSelected={this._onMessageSelected}
                selectedMessageID={this.state.selectedMessageID}
              />
              {this.state.threads.result.hasMore ? (
                <div style={styles.messageLoading}>
                  You{"'"}ve seen {this.state.threads.result.items.length}.
                  {this.state.threads.result.items.length >= 100 ? (
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
            {selectedThread ? (
              <ThreadView
                thread={selectedThread}
                selectedMessageID={this.state.selectedMessageID}
                onThreadClosed={this._onThreadClosed}
              />
            ) : null}
          </div>
        </div>
        {(!this.state.isAuthorizing && !this.state.isAuthorized) ? (
          <LoginModal />
        ) : null}
      </div>
    );
  }
});

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

  spinner: {
    left: 0,
    position: 'fixed',
    top: 0,
    width: '100%',
    zIndex: 10000,

    ':after': {
      animation: 'pulse 3s ease 0s infinite',
      background: Colors.accent,
      content: ' ',
      display: 'block',
      height: '4px',
      margin: '0 auto',
    },

    '@keyframes pulse': {
      '0%':   {width: '10%'},
      '50%':  {width: '50%'},
      '100%': {width: '10%'},
    },
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

React.render(<App />, document.body);

