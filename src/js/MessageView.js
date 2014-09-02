/** @jsx React.DOM */

var HTMLSandbox = require('./HTMLSandbox');
var RelativeDate = require('./RelativeDate');
var React = require('react');
var asap = require('asap');
var moment = require('moment');

var PropTypes = React.PropTypes;
var _ = require('lodash');
var cx = React.addons.classSet;

var MessageView = React.createClass({
  propTypes: {
    message: PropTypes.object,
    isExpandedInitially: PropTypes.bool,
  },

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
        <div className={cx(this.props.className, 'MessageView')} />
      );
    }

    var msg = this.props.message;
    var isExpanded = this._isExpanded();
    var body = isExpanded && msg.body['text/html'] ||
      '<div style="white-space:pre">' +
        _.escape(msg.body['text/plain']) +
      '</div>';

    return (
      <div className={cx(
        this.props.className,
        cx({
          'MessageView': true,
          'MessageView-expanded': isExpanded,
        })
      )}>
        <div className="MessageView_inner">
          <div
            className={cx('MessageView_header clearfix')}
            onClick={this._onHeaderClick}>
              <RelativeDate
                className="MessageView_header_date"
                date={msg.date}
              />
              <div className="MessageView_header_sender">
                {msg.from.name || msg.from.email}
              </div>
          </div>
          {isExpanded ? (
            <div>
              <div className="MessageView_subject">
                {msg.subject}
              </div>
              <HTMLSandbox
                className="MessageView_sandbox"
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

module.exports = MessageView;
