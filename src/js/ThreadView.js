/** @jsx React.DOM */

var MessageStore = require('./MessageStore');
var MessageView = require('./MessageView');
var ThreadView = require('./ThreadView');
var React = require('react');
var StoreToStateMixin = require('./StoreToStateMixin');

var PropTypes = React.PropTypes;
var PureRenderMixin = React.addons.PureRenderMixin;
var _ = require('lodash');
var cx = React.addons.classSet;

var ThreadView = React.createClass({
  propTypes: {
    thread: PropTypes.object.isRequired,
  },

  mixins: [
    PureRenderMixin,
    StoreToStateMixin({
      messages: {
        method: MessageStore.getByIDs,
        getOptions: (props, state) => ({
          ids: props.thread.messageIDs
        }),
        shouldFetch: options => !!options.ids,
      },
    })
  ],

  render() /*object*/ {
    var messages = this.state.messages.result;
    if (!messages) {
      return null;
    }

    return (
      <div>
        {messages.map(message => (
          <MessageView message={message} />
        ))}
      </div>
    );
  }
});

module.exports = ThreadView;
