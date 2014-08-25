/** @jsx React.DOM */

var HTMLSandbox = require('./HTMLSandbox');
var React = require('react');

var PropTypes = React.PropTypes;
var _ = require('lodash');
var cx = React.addons.classSet;

var MessageView = React.createClass({
  propTypes: {
    message: PropTypes.object,
  },

  render() /*object*/ {
    if (!this.props.message) {
      return (
        <div className={cx(this.props.className, 'MessageView')} />
      );
    }

    var msg = this.props.message;
    var body = msg.body['text/html'] ||
      '<div style="white-space:pre">' +
        _.escape(msg.body['text/plain']) +
      '</div>';

    console.log(body, msg)

    return (
      <div className={cx(this.props.className, 'MessageView')}>
        <HTMLSandbox
          className="MessageView_sandbox"
          html={body}
          iframeBodyStyle={{
            'font-family': window.getComputedStyle(document.body).fontFamily,
            padding: '12px',
          }}
        />
      </div>
    );
  }
});

module.exports = MessageView;
