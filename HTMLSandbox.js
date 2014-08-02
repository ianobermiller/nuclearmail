/** @jsx React.DOM */

var React = require('react');
var _ = require('lodash');

var PropTypes = React.PropTypes;

var HTMLSandbox = React.createClass({
  propTypes: {
    html: PropTypes.string,
    iframeBodyStyle: PropTypes.object
  },

  _onWindowMessageReceived(event) {
    if (!event.data.height) {
      return;
    }
    // Add 20 in case there is a horizontal scroll bar
    this.getDOMNode().height = event.data.height + 20;
  },

  _setIframeContents() {
    var iframe = this.getDOMNode();

    var iframeBodyStyle = iframe.contentDocument.body.style;
    iframeBodyStyle.margin = 0;
    iframeBodyStyle.padding = 0;
    iframeBodyStyle.wordBreak = 'break-word';

    _.assign(iframeBodyStyle, this.props.iframeBodyStyle);

    iframe.contentDocument.body.innerHTML = this.props.html;

    var script = document.createElement('script');
    script.innerHTML = `
      window.parent.postMessage({
        height: document.documentElement.offsetHeight
      }, window.parent.location.href);
    `;
    iframe.contentDocument.body.appendChild(script);
  },

  componentDidMount() {
    window.addEventListener('message', this._onWindowMessageReceived, false);
    this._setIframeContents();
  },

  componentDidUpdate() {
    this._setIframeContents();
  },

  componentWillUnmount() {
    window.removeEventListener('message', this._onWindowMessageReceived);
  },

  render: function() {
    return (
      <iframe border="none" width="100%" height="0" />
    );
  }
});

module.exports = HTMLSandbox;
