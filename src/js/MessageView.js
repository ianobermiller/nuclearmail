/** @jsx React.DOM */

var HTMLSandbox = require('./HTMLSandbox');
var React = require('react');
var moment = require('moment');

var PropTypes = React.PropTypes;
var _ = require('lodash');
var cx = React.addons.classSet;

var MessageView = React.createClass({
  propTypes: {
    message: PropTypes.object,
  },

  getInitialState() {
    return {
      isExpanded: false,
    };
  },

  _onHeaderClick() {
    this.setState({isExpanded: !this.state.isExpanded});
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

    return (
      <div className={cx(this.props.className, 'MessageView')}>
        <div
          className={cx('MessageView_header clearfix')}
          onClick={this._onHeaderClick}>
            <div className="MessageView_header_date">
              {moment(msg.date).fromNow()}
            </div>
            <div className="MessageView_header_sender">
              {msg.from.name || msg.from.email}
            </div>
        </div>
        {this.state.isExpanded ? (
          <HTMLSandbox
            className="MessageView_sandbox"
            html={body}
            iframeBodyStyle={{
              'font-family': window.getComputedStyle(document.body).fontFamily,
              padding: '12px',
            }}
            showImages={true}
          />
        ) : null}
      </div>
    );
  }
});

module.exports = MessageView;
