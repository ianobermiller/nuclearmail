/** @flow */

var Colors = require('./Colors');
var HTMLSandbox = require('./HTMLSandbox');
var React = require('react');
var RelativeDate = require('./RelativeDate');
var asap = require('asap');
var sx = require('./styleSet');

var PropTypes = React.PropTypes;
var PureRenderMixin = React.addons.PureRenderMixin;
var _ = require('lodash');

var MessageView = React.createClass({
  propTypes: {
    message: PropTypes.object,
    isExpandedInitially: PropTypes.bool,
  },

  mixins: [PureRenderMixin],

  componentDidMount() {
    if (this.props.isExpandedInitially) {
      asap(() => {
        if (this.isMounted()) {
          this.getDOMNode().scrollIntoView(true);
        }
      });
    }
  },

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
      <div style={sx(this.props.style, styles.root)}>
        <div style={styles.inner}>
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
          <HTMLSandbox
            style={styles.sandbox}
            html={body}
            iframeBodyStyle={{
              fontFamily: window.getComputedStyle(document.body).fontFamily,
              padding: '12px',
            }}
            showImages={true}
          />
        </div>
      </div>
    );
  }
});

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

  sandbox: {
    fontSize: 14,
    marginTop: 12,
    width: 'calc(100% - 24px)',
  },
};

module.exports = MessageView;
