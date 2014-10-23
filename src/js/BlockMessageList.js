/** @jsx React.DOM */
/** @jsx React.DOM */

var Colors = require('./Colors');
var LineClamp = require('./LineClamp');
var React = require('react/addons');
var RelativeDate = require('./RelativeDate');
var StyleMixin = require('./StyleMixin');
var Styles = require('./Styles');
var _ = require('lodash');

var PureRenderMixin = React.addons.PureRenderMixin;
var PropTypes = React.PropTypes;
var cx = React.addons.classSet;

var BlockMessageList = React.createClass({
  propTypes: {
    messages: PropTypes.array.isRequired,

    labels: PropTypes.array,
    selectedMessageID: PropTypes.string,
  },

  mixins: [
    PureRenderMixin,
    StyleMixin({
      root: {
        cursor: 'pointer',
        userSelect: 'none',
      },
    }),
  ],

  _onMessageClick(index, message) {
    this.props.onMessageSelected(message);
  },

  render() {
    return (
      <ul className={cx(this.props.className, this.styles.root)}>
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
  propTypes: {
    index: PropTypes.number.isRequired,
    isSelected: PropTypes.bool.isRequired,
    message: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,

    labels: PropTypes.object,
  },

  mixins: [
    PureRenderMixin,
    StyleMixin({
      item: {
        lineHeight: 1.6,
        margin: '0 8px 8px 8px',

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
    }),
  ],

  _onClick() {
    this.props.onClick(this.props.index, this.props.message);
  },

  render() {
    var msg = this.props.message;
    return (
      <li
        className={cx(this.styles.item)}
        key={msg.id}
        onClick={this._onClick}>
        <div className={cx(
          this.styles.itemInner,
          msg.isUnread && this.styles.itemInnerIsUnread,
          this.props.isSelected && this.styles.itemInnerIsSelected
        )}>
          <div className={this.styles.itemTop}>
            <RelativeDate
              className={this.styles.itemDate}
              date={msg.date}
            />
            <div className={cx(
              this.styles.itemSender,
              this.props.isSelected && this.styles.itemSenderIsSelected
            )}>
              {msg.isStarred ? (
                <span className={this.styles.star}>{'\u2605'}</span>
              ) : null}
              {msg.from.name || msg.from.email}
            </div>
          </div>
          <LineClamp className={this.styles.itemText} lines={2}>
            {this.props.labels && msg.labelIDs.filter(labelID =>
              this.props.labels[labelID].type === 'user'
            ).map(labelID =>
              <span className={this.styles.itemLabel} key={labelID}>
                {this.props.labels ? this.props.labels[labelID].name : labelID}
              </span>
            )}
            <span>
              {msg.subject}{' '}
            </span>
            <span className={this.styles.itemSnippet}>
              {_.unescape(msg.snippet)}…
            </span>
          </LineClamp>
        </div>
      </li>
    );
  }
});

module.exports = BlockMessageList;
