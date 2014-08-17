/** @jsx React.DOM */

var React = require('react/addons');
var _ = require('lodash');
var moment = require('moment');

var PureRenderMixin = React.addons.PureRenderMixin;
var PropTypes = React.PropTypes;
var cx = React.addons.classSet;

var BlockMessageList = React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    messages: PropTypes.array.isRequired
  },

  _onMessageClick(index, message) {
    this.props.onMessageSelected(message);
  },

  render() {
    return (
      <ul className={cx(this.props.className, 'BlockMessageList')}>
        {this.props.messages.map((msg, index) => (
          <BlockMessageListItem
            message={msg}
            index={index}
            onClick={this._onMessageClick}
          />
        ))}
      </ul>
    );
  }
});

var BlockMessageListItem = React.createClass({
  propTypes: {
    index: React.PropTypes.number.isRequired,
    message: React.PropTypes.object.isRequired,
    onClick: React.PropTypes.func.isRequired,
  },

  _onClick() {
    this.props.onClick(this.props.index, this.props.message);
  },

  render() {
    var msg = this.props.message;
    return (
      <li
          className="BlockMessageList_item"
          key={msg.id}
          onClick={this._onClick}>
          <div className="BlockMessageList_item_top">
            <div className="BlockMessageList_item_sender">
              {msg.from.name || msg.from.email}
            </div>
            <div className="BlockMessageList_item_date">
              {moment(msg.date).fromNow()}
            </div>
          </div>
          <div className="BlockMessageList_item_text">
            <span className="BlockMessageList_item_subject">
              {msg.subject}{' '}
            </span>
            <span className="BlockMessageList_item_snippet">
              {_.unescape(msg.snippet)}…
            </span>
          </div>
      </li>
    );
  }
});

module.exports = BlockMessageList;
