/** @flow */

var Colors = require('./Colors');
var HTMLSandbox = require('./HTMLSandbox');
var PureRender = require('./PureRender');
var Radium = require('radium');
var RelativeDate = require('./RelativeDate');
var _ = require('lodash');
var asap = require('asap');
var {Component, PropTypes, findDOMNode} = require('react/addons');

@PureRender
@Radium.Enhancer
class MessageView extends Component {
  static propTypes = {
    isExpandedInitially: PropTypes.bool,
    message: PropTypes.object,
    style: PropTypes.object,
  };

  constructor() {
    super();
    this.state = {
      isExpandedManually: null,
    };
  }

  componentDidMount() {
    if (this.props.isExpandedInitially) {
      asap(() => {
        findDOMNode(this).scrollIntoView(true);
      });
    }
  }

  _onClick = () => {
    this.setState({isExpandedManually: !this._isExpanded()});
  };

  _isExpanded(): bool {
    return this.state.isExpandedManually !== null ?
      this.state.isExpandedManually :
      this.props.isExpandedInitially;
  }

  render(): any {
    if (!this.props.message) {
      return (
        <div style={sx(this.props.style, 'MessageView')} />
      );
    }

    var msg = this.props.message;
    var body = msg.body['text/html'] ||
      '<div style="white-space:pre">' +
        _.escape(msg.body['text/plain']) +
      '</div>';

    return (
      <div style={[this.props.style, styles.root]} onClick={this._onClick}>
        <div style={[
          styles.inner,
          !this._isExpanded() && styles.innerCollapsed
        ]}>
          <div style={styles.header}>
            <div style={styles.headerSender}>
              <div>
                <span style={styles.partyType}>From:</span>
                {' '}
                <span style={styles.fromName}>{msg.from.name}</span>
                {' <' + msg.from.email + '>'}
              </div>
              <div>
                <span style={styles.partyType}>To:</span>
                {' ' + msg.to.name + ' <' + msg.to.email + '>'}
              </div>
            </div>
            <RelativeDate
              style={styles.headerDate}
              date={msg.date}
            />
          </div>
          {this._isExpanded() ? (
            <HTMLSandbox
              html={body}
              iframeBodyStyle={{
                fontFamily: window.getComputedStyle(document.body).fontFamily,
                fontSize: '14px',
                padding: '12px',
              }}
              showImages={true}
            />
          ) : (
            <div style={styles.snippet}>{msg.snippet}</div>
          )}
        </div>
      </div>
    );
  }
}

var styles = {
  root: {
    margin: '4px 12px 12px 12px',
  },

  inner: {
    background: 'white',
    borderRadius: '4px',
    boxShadow: '0px 1px 2px 1px #ddd',
    padding: 12,
  },

  innerCollapsed: {
    background: Colors.gray1,
  },

  header: {
    borderBottom: '1px solid ' + Colors.gray2,
    display: 'flex',
    fontSize: '13px',
    paddingBottom: 12,
  },

  headerSender: {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  fromName: {
    fontWeight: 'bold',
  },

  headerDate: {
    color: Colors.gray3,
    textAlign: 'right',
  },

  subject: {
    fontSize: 14,
    margin: '0 12px',
  },

  partyType: {
    color: Colors.gray3,
    display: 'inline-block',
    marginRight: 4,
    textAlign: 'right',
    width: 35,
  },

  snippet: {
    fontSize: 14,
    marginTop: 12,
  },
};

module.exports = MessageView;
