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

var InlineMessageList = React.createClass({
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
      <InlineMessageListItem
        message={msg}
        index={index}
        isExpanded={this.state.expandedIndex === index}
        onClick={this._onMessageClick}
      />
    ));
    return (
      <ul className="InlineMessageList">
        <li
          className={cx(
            'InlineMessageList_item',
            'InlineMessageList_item-header'
          )}
          key="header">
          <div className="InlineMessageList_item_target">
            <div className="InlineMessageList_item_sender">
              From
            </div>
            <div className="InlineMessageList_item_content">
              <span className="InlineMessageList_item_subject">
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

var InlineMessageListItem = React.createClass({
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
          'InlineMessageList_item': true,
          'InlineMessageList_item-expanded': isExpanded
        })}
        key={msg.id}>
        <div
          className="InlineMessageList_item_target"
          onClick={this._onClick}>
          <div className="InlineMessageList_item_sender">
            {msg.from.name || msg.from.email}
          </div>
          <div className="InlineMessageList_item_date">
            {moment(msg.date).fromNow()}
          </div>
          <div className="InlineMessageList_item_content">
            <span className="InlineMessageList_item_subject">
              {msg.subject}{' '}
            </span>
            <span className="InlineMessageList_item_snippet">
              {_.unescape(msg.snippet)}
            </span>
          </div>
        </div>
        {
          isExpanded ? (
            <div className="InlineMessageList_item_content">
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

module.exports = InlineMessageList;
