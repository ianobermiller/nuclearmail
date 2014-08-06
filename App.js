/** @jsx React.DOM */

require('es6-shim');

var MessageList = require('./MessageList');
var MessageStore = require('./MessageStore');
var React = require('react');
var StoreToStateMixin = require('./StoreToStateMixin');

var App = React.createClass({
  mixins: [StoreToStateMixin({
    messages: (props, state) => ({
      method: MessageStore.getMessages,
      options: {query: state.query},
    }),
  })],

  getInitialState() {
    return {
      query: '',
      queryProgress: '',
    };
  },

  _onQueryKeyDown(e) {
    if (e.key === 'Enter') {
      this.setState({query: e.target.value});
    }
  },

  _onQueryChange(e) {
    this.setState({queryProgress: e.target.value});
  },

  _onSearchClick() {
    this.setState({query: this.state.queryProgress});
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
        {this.state.messages.value ?
          <MessageList messages={this.state.messages.value} /> :
          <div>Loading</div>}
      </div>
    );
  }
});

React.renderComponent(<App />, document.body);

