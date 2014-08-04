/** @jsx React.DOM */

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

  render() {
    if (!this.state.messages.value) {
      return <div>Loading</div>;
    }

    return (
      <div className="App">
        <div>
          <input
            value={this.state.queryProgress}
            onChange={this._onQueryChange}
            onKeyDown={this._onQueryKeyDown}
          />
        </div>
        <MessageList messages={this.state.messages.value} />
      </div>
    );
  }
});

React.renderComponent(<App />, document.body);

