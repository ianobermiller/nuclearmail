/** @jsx React.DOM */
/** @jsx React.DOM */

var Colors = require('./Colors');
var LineClamp = require('./LineClamp');
var React = require('react/addons');
var RelativeDate = require('./RelativeDate');
var StyleSet = require('./StyleSet');
var Styles = require('./Styles');
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
      <ul className={cx(this.props.className, Classes.root)}>
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
        className={cx(Classes.item)}
        key={msg.id}
        onClick={this._onClick}>
        <div className={cx(
          Classes.itemInner,
          msg.isUnread && Classes.itemInnerIsUnread,
          this.props.isSelected && Classes.itemInnerIsSelected
        )}>
          <div className={Classes.itemTop}>
            <RelativeDate
              className={Classes.itemDate}
              date={msg.date}
            />
            <div className={cx(
              Classes.itemSender,
              this.props.isSelected && Classes.itemSenderIsSelected
            )}>
              {msg.isStarred ? (
                <span className={Classes.star}>{'\u2605'}</span>
              ) : null}
              {msg.from.name || msg.from.email}
            </div>
          </div>
          <LineClamp className={Classes.itemText} lines={2}>
            {this.props.labels && msg.labelIDs.filter(labelID =>
              this.props.labels[labelID].type === 'user'
            ).map(labelID =>
              <span className={Classes.itemLabel} key={labelID}>
                {this.props.labels ? this.props.labels[labelID].name : labelID}
              </span>
            )}
            <span>
              {msg.subject}{' '}
            </span>
            <span className={Classes.itemSnippet}>
              {_.unescape(msg.snippet)}…
            </span>
          </LineClamp>
        </div>
      </li>
    );
  }
});

var {Classes, Styles} = StyleSet('BlockMessageList', {
  root: {
    cursor: 'pointer',
    userSelect: 'none',
  },

  item: {
    borderTop: 'solid 1px #f5f5f5',
    lineHeight: 1.6,
    margin: ' 8px',

    ':first-child': {
      borderTop: 'none',
    }
  },

  itemInner: {
    borderRadius: '8px',
    padding: '8px 12px 12px 12px',
  },

  itemInnerIsUnread: {
    background: Colors.accent.lighten(40),
  },

  itemInnerIsSelected: {
    background: Colors.accent,
    color: 'white',
  },

  itemTop: Styles.clearfix,

  itemDate: {
    float: 'right',
    opacity: 0.5,
    fontSize: '14px',
  },

  itemText: {
    fontSize: '14px',
  },

  itemLabel: {
    background: Colors.accent,
    borderRadius: '4px',
    color: 'white',
    display: 'inline-block',
    marginRight: '4px',
    padding: '0 4px',
  },

  itemSender: {
    color: Colors.accent,
    fontWeight: 'bold',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  itemSenderIsSelected: {
    color: 'white',
  },

  itemSnippet: {
    opacity: 0.5,
  },

  star: {
    color: 'yellow',
    marginRight: '4px',
    textShadow: `
      -1px -1px 0 #999,
      1px -1px 0 #999,
      -1px 1px 0 #999,
      1px 1px 0 #999,
      -1px 0 0 #999,
      1px 0 0 #999,
      0 1px 0 #999,
      0 -1px 0 #999
    `,
  },
});

module.exports = BlockMessageList;
