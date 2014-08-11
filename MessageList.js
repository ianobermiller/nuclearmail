/** @jsx React.DOM */

var HTMLSandbox = require('./HTMLSandbox');
var React = require('react/addons');
var _ = require('lodash');
var moment = require('moment');

var PureRenderMixin = React.addons.PureRenderMixin;
var PropTypes = React.PropTypes;
var cx = React.addons.classSet;

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

var MessageList = React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    messages: PropTypes.array.isRequired
  },

  getInitialState: function() {
    return {
      expandedIndex: null
    };
  },

  _onMessageClick(index) {
    if (this.state.expandedIndex === index) {
      index = null;
    }

    this.setState({
      expandedIndex: index
    });
  },

  render() {
    var items = this.props.messages.map((msg, index) => (
      <MessageListItem
        message={msg}
        index={index}
        isExpanded={this.state.expandedIndex === index}
        onClick={this._onMessageClick}
      />
    ));
    return (
      <ul className="MessageList">
        <li
          className={cx(
            'MessageList_item',
            'MessageList_item-header'
          )}
          key="header">
          <div className="MessageList_item_target">
            <div className="MessageList_item_sender">
              From
            </div>
            <div className="MessageList_item_content">
              <span className="MessageList_item_subject">
                Subject
              </span>
            </div>
          </div>
        </li>
        {items}
      </ul>
    );
  }
});

var MessageListItem = React.createClass({
  propTypes: {
    index: React.PropTypes.number.isRequired,
    isExpanded: React.PropTypes.bool.isRequired,
    message: React.PropTypes.object.isRequired,
    onClick: React.PropTypes.func.isRequired,
  },

  _onClick() {
    this.props.onClick(this.props.index, this.props.message);
  },

  render() {
    var msg = this.props.message;
    var body = msg.body['text/html'] ||
      '<div style="white-space:pre">' +
        _.escape(msg.body['text/plain']) +
      '</div>';

    var isExpanded = this.props.isExpanded;
    return (
      <li
        className={cx({
          'MessageList_item': true,
          'MessageList_item-expanded': isExpanded
        })}
        key={msg.id}>
        <div
          className="MessageList_item_target"
          onClick={this._onClick}>
          <div className="MessageList_item_sender">
            {msg.from.name || msg.from.email}
          </div>
          <div className="MessageList_item_date">
            {moment(msg.date).fromNow()}
          </div>
          <div className="MessageList_item_content">
            <span className="MessageList_item_subject">
              {msg.subject}{' '}
            </span>
            <span className="MessageList_item_snippet">
              {_.unescape(msg.snippet)}
            </span>
          </div>
        </div>
        {
          isExpanded ? (
            <div className="MessageList_item_content">
              <HTMLSandbox
                html={body}
                iframeBodyStyle={{
                  'font-family': window.getComputedStyle(document.body).fontFamily
                }}
              />
            </div>
          ) : null
        }
      </li>
    );
  }
});

module.exports = MessageList;
