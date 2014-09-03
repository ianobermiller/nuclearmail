/** @jsx React.DOM */

var React = require('react/addons');
var RelativeDate = require('./RelativeDate');
var _ = require('lodash');

var PureRenderMixin = React.addons.PureRenderMixin;
var PropTypes = React.PropTypes;
var cx = React.addons.classSet;

var BlockMessageList = React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    messages: PropTypes.array.isRequired,

    labels: PropTypes.array,
    selectedMessageID: PropTypes.string,
  },

  _onMessageClick(index, message) {
    this.props.onMessageSelected(message);
  },

  render() {
    return (
      <ul className={cx(this.props.className, 'BlockMessageList')}>
        {this.props.messages.map((msg, index) => (
          <BlockMessageListItem
            index={index}
            isSelected={msg.id === this.props.selectedMessageID}
            key={index}
            labels={this.props.labels && _.indexBy(this.props.labels, 'id')}
            message={msg}
            onClick={this._onMessageClick}
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
    isSelected: PropTypes.bool.isRequired,
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
          'BlockMessageList_item-selected': this.props.isSelected,
        })}
        key={msg.id}
        onClick={this._onClick}>
        <div className="BlockMessageList_item_inner">
          <div className="BlockMessageList_item_top">
            <RelativeDate
              className="BlockMessageList_item_date"
              date={msg.date}
            />
            <div className="BlockMessageList_item_sender">
              {msg.from.name || msg.from.email}
            </div>
          </div>
          <div className="BlockMessageList_item_text">
            {this.props.labels && msg.labelIDs.filter(labelID =>
              this.props.labels[labelID].type === 'user'
            ).map(labelID =>
              <span className="BlockMessageList_item_label" key={labelID}>
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
        </div>
      </li>
    );
  }
});

module.exports = BlockMessageList;
