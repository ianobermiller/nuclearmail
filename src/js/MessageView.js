/** @jsx React.DOM */

var HTMLSandbox = require('./HTMLSandbox');
var React = require('react');
var RelativeDate = require('./RelativeDate');
var asap = require('asap');
var moment = require('moment');
var sx = require('./StyleSet');

var PropTypes = React.PropTypes;
var PureRenderMixin = React.addons.PureRenderMixin;
var _ = require('lodash');

var MessageView = React.createClass({
  propTypes: {
    message: PropTypes.object,
    isExpandedInitially: PropTypes.bool,
  },

  mixins: [PureRenderMixin],

  getInitialState() {
    return {
      isExpanded: null,
    };
  },

  _onHeaderClick() {
    this.setState({isExpanded: !this.state.isExpanded});
  },

  componentDidMount() {
    if (this._isExpanded()) {
      asap(() => this.getDOMNode().scrollIntoView(true));
    }
  },

  _isExpanded() {
    return this.state.isExpanded ||
      (this.state.isExpanded === null && this.props.isExpandedInitially);
  },

  render() /*object*/ {
    if (!this.props.message) {
      return (
        <div style={sx(this.props.style, 'MessageView')} />
      );
    }

    var msg = this.props.message;
    var isExpanded = this._isExpanded();
    var body = isExpanded && msg.body['text/html'] ||
      '<div style="white-space:pre">' +
        _.escape(msg.body['text/plain']) +
      '</div>';

    return (
      <div style={sx(this.props.style, styles.root)}>
        <div style={sx(
          styles.inner,
          isExpanded && styles.innerIsExpanded
        )}>
          <div
            style={styles.header}
            onClick={this._onHeaderClick}>
              <div style={styles.headerSender}>
                {msg.from.name || msg.from.email}
              </div>
              <RelativeDate
                style={styles.headerDate}
                date={msg.date}
              />
          </div>
          {isExpanded ? (
            <div>
              <div style={styles.subject}>
                {msg.subject}
              </div>
              <HTMLSandbox
                style={styles.sandbox}
                html={body}
                iframeBodyStyle={{
                  'font-family': window.getComputedStyle(document.body).fontFamily,
                  padding: '12px',
                }}
                showImages={true}
              />
            </div>
          ) : null}
        </div>
      </div>
    );
  }
});

var styles = {
  root: {
    padding: '12px 12px 0 12px',
  },

  inner: {
    background: '#f9f9f9',
    borderRadius: '4px',
    boxShadow: '0px 1px 2px 1px #ddd',
  },

  innerIsExpanded: {
    background: 'white',
  },

  header: {
    cursor: 'pointer',
    display: 'flex',
    padding: '12px',
  },

  headerSender: {
    fontWeight: 'bold',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  headerDate: {
    color: '#666',
    flex: 1,
    fontSize: '14px',
    textAlign: 'right',
  },

  subject: {
    fontSize: '14px',
    margin: '0 12px',
  },

  sandbox: {
    borderTop: '1px solid #eee',
    margin: '12px',
    width: 'calc(100% - 24px)',
  },
};

module.exports = MessageView;
