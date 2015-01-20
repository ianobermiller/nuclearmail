/** @flow */

var React = require('react');
var sanitizer = require('google-caja');

var PropTypes = React.PropTypes;

var HTMLSandbox = React.createClass({
  propTypes: {
    html: PropTypes.string,
    iframeBodyStyle: PropTypes.object,
    setHeightToContent: PropTypes.bool,
    showImages: PropTypes.bool,
  },

  getDefaultProps() {
    return {
      setHeightToContent: true,
    };
  },

  _onWindowMessageReceived(event: any) {
    if (!this.isMounted()) {
      return;
    }

    if (!event.data.height) {
      return;
    }

    this.getDOMNode().height = event.data.height;
  },

  _setIframeContents() {
    if (!this.isMounted()) {
      return;
    }

    var iframe = this.getDOMNode();

    var iframeBodyStyle = iframe.contentDocument.body.style;
    iframeBodyStyle.margin = 0;
    iframeBodyStyle.overflowX = 'hidden';
    iframeBodyStyle.padding = 0;
    iframeBodyStyle.wordBreak = 'break-word';

    Object.assign(iframeBodyStyle, this.props.iframeBodyStyle);

    var sanitizedHtml = sanitizer.sanitizeWithPolicy(
      this.props.html,
      this.props.showImages ? defaultTagPolicy : tagPolicyNoImages
    );

    iframe.contentDocument.body.innerHTML = sanitizedHtml;

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
      setTimeout(notifyHeightChanged, 0);

      Array.prototype.forEach.call(
        document.getElementsByTagName('img'),
        function(el) { el.addEventListener('load', notifyHeightChanged); }
      );

      Array.prototype.forEach.call(
        document.getElementsByTagName('a'),
        function(el) { el.target = '_blank'; }
      );
    `;
    iframe.contentDocument.body.appendChild(script);
  },

  componentDidMount() {
    if (this.props.setHeightToContent) {
      window.addEventListener('message', this._onWindowMessageReceived, false);
    }
    this._setIframeContents();
  },

  componentDidUpdate(previousProps: any, previousState: any) {
    this._setIframeContents();
  },

  componentWillUnmount() {
    window.removeEventListener('message', this._onWindowMessageReceived);
  },

  render(): any {
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

function acceptAllUriRewriter(uri, prop) {
  return uri;
}

function tagPolicyNoImages(tagName, attribs) {
  if (tagName === 'img') {
    return;
  }

  return defaultTagPolicy(tagName, attribs);
}

var defaultTagPolicy = sanitizer.makeTagPolicy(acceptAllUriRewriter);

module.exports = HTMLSandbox;
