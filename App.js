/** @jsx React.DOM */

var MessageList = require('./MessageList');
var MessageStore = require('./MessageStore');
var React = require('react');
var StoreToStateMixin = require('./StoreToStateMixin');

var App = React.createClass({
  mixins: [StoreToStateMixin({
    messages: (props, state) => MessageStore.getMessages(),
  })],

  render() {
    if (!this.state.messages.value) {
      return <div>Loading</div>;
    }

    return (
      <div className="App">
        <MessageList messages={this.state.messages.value} />
      </div>
    );
  }
});

React.renderComponent(<App />, document.body);

