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
    messages: PropTypes.array.isRequired,

    labels: PropTypes.array,
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
            labels={this.props.labels && _.indexBy(this.props.labels, 'id')}
          />
        ))}
      </ul>
    );
  }
});

var BlockMessageListItem = React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    index: PropTypes.number.isRequired,
    message: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,

    labels: PropTypes.object,
  },

  _onClick() {
    this.props.onClick(this.props.index, this.props.message);
  },

  render() {
    var msg = this.props.message;
    return (
      <li
          className={cx({
            'BlockMessageList_item': true,
            'BlockMessageList_item-unread': msg.isUnread,
          })}
          key={msg.id}
          onClick={this._onClick}>
          <div className="BlockMessageList_item_top">
            <div className="BlockMessageList_item_date">
              {moment(msg.date).fromNow()}
            </div>
            <div className="BlockMessageList_item_sender">
              {msg.from.name || msg.from.email}
            </div>
          </div>
          <div className="BlockMessageList_item_text">
            {this.props.labels && msg.labelIDs.filter(labelID =>
                this.props.labels[labelID].type === 'user'
            ).map(labelID =>
              <span className="BlockMessageList_item_label">
                {this.props.labels ? this.props.labels[labelID].name : labelID}
              </span>
            )}
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
