/** @jsx React.DOM */

require('es6-shim');

var API = require('./API');
var BlockMessageList = require('./BlockMessageList');
var InfiniteScroll = require('./InfiniteScroll');
var LabelStore = require('./LabelStore');
var MessageView = require('./MessageView');
var MessageStore = require('./MessageStore');
var React = require('react');
var SearchBox = require('./SearchBox');
var StoreToStateMixin = require('./StoreToStateMixin');
var ThreadStore = require('./ThreadStore');
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
        getOptions: (props, state) => ({
          // TODO: shouldn't need this
        }),
      },
      threads: {
        method: ThreadStore.list,
        getOptions: (props, state) => ({
          query: state.query,
          maxResultCount: state.maxResultCount,
        }),
      },
      messages: {
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
  },

  componentWillUnmount() {
    this._subscriptions.forEach(s => s.remove());
  },

  getInitialState() {
    return {
      isLoading: true,
      maxResultCount: PAGE_SIZE,
      query: '',
      selectedMessage: null,
    };
  },

  _onRequestMoreItems() {
    this.setState({maxResultCount: this.state.maxResultCount + PAGE_SIZE});
  },

  _onMessageSelected(message) {
    this.setState({
      selectedMessage: message
    });
  },

  _onQueryChange(query) {
    this.setState({
      query: query,
      maxResultCount: PAGE_SIZE,
    });
  },

  render() {
    return (
      <div className="App">
        {this.state.isLoading ? <div className="App_spinner" /> : null}
        <SearchBox className="App_search" onQueryChange={this._onQueryChange} />
        <div className="App_messages">
          {this.state.messages.result ? (
            <InfiniteScroll
              className="App_messages_list"
              hasMore={this.state.threads.result.hasMore}
              isScrollContainer={true}
              onRequestMoreItems={this._onRequestMoreItems}>
              <BlockMessageList
                labels={this.state.labels.result}
                messages={this.state.messages.result}
                onMessageSelected={this._onMessageSelected}
                selectedMessage={this.state.selectedMessage}
              />
            </InfiniteScroll>
          ) : (
            <div className="App_messages_list" />
          )}
          <MessageView
            className="App_messages_selected"
            message={this.state.selectedMessage}
          />
        </div>
      </div>
    );
  }
});

React.renderComponent(<App />, document.body);

