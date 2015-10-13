/** @flow */

const Colors = require('./Colors');
const LineClamp = require('./LineClamp');
const PureRender = require('./PureRender');
const Radium = require('radium');
const React = require('react');
const RelativeDate = require('./RelativeDate');
const _ = require('lodash');
const {Component, PropTypes, findDOMNode} = require('react');

@PureRender
@Radium
class BlockMessageList extends Component {
  static propTypes = {
    messages: PropTypes.array.isRequired,
    onMessageSelected: PropTypes.func.isRequired,

    labels: PropTypes.array,
    selectedMessageID: PropTypes.string,
  };

  _onMessageClick = (index: number, message: string) => {
    this.props.onMessageSelected(message);
  };

  render(): any {
    return (
      <ul style={[styles.list.root, this.style]}>
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
}

@PureRender
@Radium
class BlockMessageListItem extends Component {
  static propTypes = {
    index: PropTypes.number.isRequired,
    isSelected: PropTypes.bool.isRequired,
    message: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,

    labels: PropTypes.object,
  };

  componentDidMount() {
    this._scrollIntoView();
  }

  componentDidUpdate(previousProps: any, previousState: any) {
    this._scrollIntoView();
  }

  _scrollIntoView() {
    if (this.props.isSelected) {
      findDOMNode(this).scrollIntoViewIfNeeded ?
        findDOMNode(this).scrollIntoViewIfNeeded(false) :
        findDOMNode(this).scrollIntoView(false);
    }
  };

  _onClick = () => {
    this.props.onClick(this.props.index, this.props.message);
  };

  render(): any {
    const msg = this.props.message;
    return (
      <li
        key={msg.id}
        onClick={this._onClick}
        style={styles.item.root}>
        <div style={[
          styles.item.inner,
          msg.isUnread && styles.item.innerIsUnread,
          this.props.isSelected && styles.item.innerIsSelected
        ]}>
          <div style={styles.item.top}>
            <div style={[
              styles.item.sender,
              this.props.isSelected && styles.item.senderIsSelected
            ]}>
              {msg.isStarred ? (
                <span style={styles.item.star}>{'\u2605'}</span>
              ) : null}
              {msg.from.name || msg.from.email}
            </div>
            <RelativeDate
              date={msg.date}
              style={styles.item.date}
            />
          </div>
          <LineClamp lines={2} style={styles.item.text}>
            {this.props.labels && msg.labelIDs.filter(labelID =>
              this.props.labels[labelID] &&
                this.props.labels[labelID].type === 'user'
            ).map(labelID =>
              <span key={labelID} style={styles.item.label}>
                {this.props.labels ? this.props.labels[labelID].name : labelID}
              </span>
            )}
            <span>
              {msg.subject}{' '}
            </span>
            <span style={styles.item.snippet}>
              {_.unescape(msg.snippet)}…
            </span>
          </LineClamp>
        </div>
      </li>
    );
  }
}

const styles = {
  list: {
    root: {
      cursor: 'pointer',
      userSelect: 'none',
    }
  },

  item: {
    root: {
      display: 'block',
      lineHeight: 1.6,
      margin: '0 8px 8px 8px',
    },

    rootFirst: {
      borderTop: 'none',
    },

    inner: {
      borderRadius: '8px',
      padding: '8px 12px 12px 12px',

      ':hover': {
        background: Colors.accent.lighten(44),
      }
    },

    innerIsUnread: {
      background: Colors.accent.lighten(40),

      ':hover': {
        background: Colors.accent.lighten(40),
      }
    },

    innerIsSelected: {
      background: Colors.accent,
      color: 'white',

      ':hover': {
        background: Colors.accent,
      }
    },

    top: {
      display: 'flex',
    },

    date: {
      fontSize: '14px',
      opacity: 0.5,
      textAlign: 'right',
      whiteSpace: 'nowrap',
    },

    text: {
      fontSize: '14px',
    },

    label: {
      background: Colors.accent,
      borderRadius: '4px',
      color: 'white',
      display: 'inline-block',
      marginRight: '4px',
      padding: '0 4px',
    },

    sender: {
      flex: 1,
      color: Colors.accent,
      fontWeight: 'bold',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },

    senderIsSelected: {
      color: 'white',
    },

    snippet: {
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
  },
};

module.exports = BlockMessageList;
