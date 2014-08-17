/** @jsx React.DOM */

require('es6-shim');

var InfiniteScroll = require('./InfiniteScroll');
var InlineMessageList = require('./InlineMessageList');
var MessageStore = require('./MessageStore');
var React = require('react');
var StoreToStateMixin = require('./StoreToStateMixin');

var PureRenderMixin = React.addons.PureRenderMixin;

var PAGE_SIZE = 20;

var App = React.createClass({
  mixins: [
    PureRenderMixin,
    StoreToStateMixin({
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
      queryProgress: '',
      maxResultCount: PAGE_SIZE,
    };
  },

  _onQueryKeyDown(e) {
    if (e.key === 'Enter') {
      this._setQuery(e.target.value);
    }
  },

  _onQueryChange(e) {
    this.setState({queryProgress: e.target.value});
  },

  _onSearchClick() {
    this._setQuery(this.state.queryProgress);
  },

  _onRequestMoreItems() {
    this.setState({maxResultCount: this.state.maxResultCount + PAGE_SIZE});
  },

  _setQuery(query) {
    this.setState({
      query: this.state.queryProgress,
      maxResultCount: PAGE_SIZE,
    });
  },

  render() {
    return (
      <div className="App">
        <div className="App_search">
          <input
            className="App_search_input"
            value={this.state.queryProgress}
            onChange={this._onQueryChange}
            onKeyDown={this._onQueryKeyDown}
            type="text"
          />
          <button
              className="App_search_button"
              onClick={this._onSearchClick}
              type="button">
            Search
          </button>
        </div>
        {this.state.messages.result ? (
          <InfiniteScroll
              hasMore={this.state.messages.result.hasMore}
              onRequestMoreItems={this._onRequestMoreItems}>
            <InlineMessageList messages={this.state.messages.result.items} />
          </InfiniteScroll>
        ) : <div>Loading</div>}
      </div>
    );
  }
});

React.renderComponent(<App />, document.body);

