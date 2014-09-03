/** @jsx React.DOM */

require('es6-shim');

var API = require('./API');
var BlockMessageList = require('./BlockMessageList');
var InfiniteScroll = require('./InfiniteScroll');
var LabelStore = require('./LabelStore');
var MessageStore = require('./MessageStore');
var React = require('react');
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
      isLoading: false,
      maxResultCount: PAGE_SIZE,
      query: 'is:unread',
      queryProgress: 'is:unread',
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

  render() {
    var selectedThread = this.state.selectedThreadID && _.find(
      this.state.threads.result.items,
      {id: this.state.selectedThreadID}
    );
    return (
      <div className="App">
        {this.state.isLoading ? <div className="App_spinner" /> : null}
        <div className="App_logo">
          ☢ NUCLEARMAIL
        </div>
        {!this.state.isAuthororized ? (
          <button className="App_login" onClick={this._onLoginClick}>
            Login with Google
          </button>
        ) : null}
        <SearchBox
          className="App_search"
          query={this.state.queryProgress}
          onQueryChange={this._onQueryChange}
          onQuerySubmit={this._onQuerySubmit}
        />
        <div className="App_messages">
          {this.state.lastMessages.result ? (
            <InfiniteScroll
              className="App_messages_list"
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
            <div className="App_messages_list" />
          )}
          <div className="App_messages_selected">
            {selectedThread ? (
              <ThreadView
                thread={selectedThread}
                selectedMessageID={this.state.selectedMessageID}
              />
            ) : null}
          </div>
        </div>
      </div>
    );
  }
});

React.renderComponent(<App />, document.body);

