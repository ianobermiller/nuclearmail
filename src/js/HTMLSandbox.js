/** @jsx React.DOM */

var React = require('react');
var _ = require('lodash');

var PropTypes = React.PropTypes;

var HTMLSandbox = React.createClass({
  propTypes: {
    html: PropTypes.string,
    iframeBodyStyle: PropTypes.object,
    setHeightToContent: PropTypes.bool,
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

    Object.assign(iframeBodyStyle, this.props.iframeBodyStyle);

    iframe.contentDocument.body.innerHTML = this.props.html;

    if (!this.props.setHeightToContent) {
      return;
    }

    var script = document.createElement('script');
    script.innerHTML = `
      var lastWidth = null;
      function notifyHeightChanged() {
        var newWidth = document.documentElement.offsetWidth;
        if (newWidth !== lastWidth) {
          lastWidth = newWidth;
          window.parent.postMessage({
            height: document.documentElement.offsetHeight
          }, window.parent.location.href);
        }
      }
      window.addEventListener('resize', notifyHeightChanged);
      notifyHeightChanged();
    `;
    iframe.contentDocument.body.appendChild(script);
  },

  componentDidMount() {
    if (this.props.setHeightToContent) {
      window.addEventListener('message', this._onWindowMessageReceived, false);
    }
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
      <iframe
        border="none"
        className={this.props.className}
        height={this.props.setHeightToContent ? 0 : null}
        width="100%"
      />
    );
  }
});

module.exports = HTMLSandbox;
