/** @jsx React.DOM */

require('es6-shim');

var API = require('./API');
var BlockMessageList = require('./BlockMessageList');
var Colors = require('./Colors');
var InfiniteScroll = require('./InfiniteScroll');
var LabelStore = require('./LabelStore');
var MessageStore = require('./MessageStore');
var RCSS = require("rcss");
var React = require('react');
var SearchBox = require('./SearchBox');
var StoreToStateMixin = require('./StoreToStateMixin');
var StyleSet = require('./StyleSet');
var ThreadActions = require('./ThreadActions');
var ThreadStore = require('./ThreadStore');
var ThreadView = require('./ThreadView');
var _ = require('lodash');
var asap = require('asap');
var autoprefixer = require('autoprefixer');
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
    })
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
    this._subscriptions.push(API.subscribe('isAuthororized', isAuthororized => {
      this.setState({isAuthororized});
    }));
  },

  componentWillUnmount() {
    this._subscriptions.forEach(s => s.remove());
  },

  getInitialState() {
    return {
      isAuthororized: false,
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

  _onLoginClick() {
    API.login();
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

  render() {
    var selectedThread = this.state.selectedThreadID && _.find(
      this.state.threads.result.items,
      {id: this.state.selectedThreadID}
    );
    return (
      <div className={Classes.app}>
        {this.state.isLoading && <div className={Classes.spinner} />}
        <div className={Classes.header}>
          <span className={Classes.logo}>
            ☢ NUCLEARMAIL
          </span>
          <SearchBox
            className={Classes.search}
            query={this.state.queryProgress}
            onQueryChange={this._onQueryChange}
            onQuerySubmit={this._onQuerySubmit}
          />
          <button className={Classes.refresh} onClick={this._onRefresh}>
          ⟳
          </button>
          {!this.state.isAuthororized ? (
            <button className={Classes.login} onClick={this._onLoginClick}>
              Login with Google
            </button>
          ) : null}
        </div>
        <div className={Classes.messages}>
          {this.state.lastMessages.result ? (
            <InfiniteScroll
              className={Classes.messagesList}
              hasMore={this.state.threads.result.hasMore}
              isScrollContainer={true}
              onRequestMoreItems={this._onRequestMoreItems}>
              <BlockMessageList
                labels={this.state.labels.result}
                messages={this.state.lastMessages.result}
                onMessageSelected={this._onMessageSelected}
                selectedMessageID={this.state.selectedMessageID}
              />
            </InfiniteScroll>
          ) : (
            <div className={Classes.messagesList} />
          )}
          <div className={Classes.threadView}>
            {selectedThread ? (
              <ThreadView
                thread={selectedThread}
                selectedMessageID={this.state.selectedMessageID}
                onThreadClosed={this._onThreadClosed}
              />
            ) : null}
          </div>
        </div>
      </div>
    );
  }
});

var {Classes, Styles} = StyleSet({
  app: {
    paddingTop: '20px',
  },

  logo: {
    color: Colors.accent,
    float: 'left',
    fontSize: '24px',
    fontWeight: 'bold',
    lineHeight: '32px',
    margin: '0 12px',
  },

  search: {
    float: 'left',
    marginLeft: '12px',
  },

  refresh: {
    float: 'left',
    marginLeft: '12px',
  },

  login: {
    float: 'right',
    marginRight: '12px',
  },

  messages: {
    borderTop: `1px solid ${Colors.gray2}`,
    bottom: 0,
    display: 'flex',
    left: 0,
    position: 'absolute',
    right: 0,
    top: '73px',
  },

  messagesList: {
    borderRight: `1px solid ${Colors.gray2}`,
    flex: 1,
    minWidth: '300px',
    maxWidth: '400px',
    overflow: 'auto',
  },

  threadView: {
    background: Colors.gray1,
    flex: 2,
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
  },
});

function injectStyles() {
  var ap = autoprefixer();
  var tag = document.createElement('style');
  tag.innerHTML = ap.process(RCSS.getStylesString());
  document.getElementsByTagName('head')[0].appendChild(tag);
}

injectStyles();

React.renderComponent(<App />, document.body);

