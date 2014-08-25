/** @jsx React.DOM */

require('es6-shim');

var BlockMessageList = require('./BlockMessageList');
var InfiniteScroll = require('./InfiniteScroll');
var LabelStore = require('./LabelStore');
var MessageView = require('./MessageView');
var MessageStore = require('./MessageStore');
var React = require('react');
var SearchBox = require('./SearchBox');
var StoreToStateMixin = require('./StoreToStateMixin');
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
      messages: {
        method: MessageStore.getMessages,
        getOptions: (props, state) => ({
          query: state.query,
          maxResultCount: state.maxResultCount,
        }),
      },
    })
  ],

  getInitialState() {
    return {
      query: '',
      maxResultCount: PAGE_SIZE,
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
        <SearchBox className="App_search" onQueryChange={this._onQueryChange} />
        <div className="App_messages">
          {this.state.messages.result ? (
            <InfiniteScroll
              className="App_messages_list"
              hasMore={this.state.messages.result.hasMore}
              isScrollContainer={true}
              onRequestMoreItems={this._onRequestMoreItems}>
              <BlockMessageList
                labels={this.state.labels.result}
                messages={this.state.messages.result.items}
                onMessageSelected={this._onMessageSelected}
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

