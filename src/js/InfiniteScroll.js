/**
 * @flow
 *
 * Based off https://github.com/guillaumervls/react-infinite-scroll
 */

var React = require('react');
var sx = require('./styleSet');

var PropTypes = React.PropTypes;

var InfiniteScroll = React.createClass({
  propTypes: {
    // Whether or not to listen for scroll and resize events. Set this to `true`
    // when you have loaded all the data already.
    hasMore: PropTypes.bool.isRequired,

    // Called when page is within `threshold` of the bottom.
    onRequestMoreItems: PropTypes.func.isRequired,
    onScroll: PropTypes.func.isRequired,
    threshold: PropTypes.number.isRequired,
  },

  getDefaultProps(): {
    hasMore: boolean;
    isScrollContainer: boolean;
    onRequestMoreItems: () => void;
    threshold: number;
  } {
    return {
      hasMore: false,
      isScrollContainer: false,
      onRequestMoreItems: () => {},
      threshold: 250,
    };
  },

  componentDidMount() {
    this._attachListeners();
  },

  componentWillReceiveProps(nextProps: Object) {
    if (!nextProps.hasMore) {
      this._detachListeners();
    }
  },

  componentWillUnmount() {
    this._detachListeners();
  },

  _attachListeners() {
    window.addEventListener('resize', this._update);
    this._update();
  },

  _detachListeners() {
    window.removeEventListener('resize', this._update);
  },

  _onScroll(event: Event) {
    this.props.onScroll(event);
    this._update();
  },

  _lastHeight: 0,

  _update() {
    var el = this.getDOMNode();
    var height = el.scrollHeight;
    // ScrollTop + offsetHeight is within threshold of scrollHeight
    var isPastThreshold = (el.scrollHeight -
      el.offsetHeight -
      el.scrollTop
    ) < Number(this.props.threshold);

    if ((!this._lastHeight || this._lastHeight < height) && isPastThreshold) {
      // call loadMore after _detachListeners to allow
      // for non-async loadMore functions
      this.props.onRequestMoreItems();
      this._lastHeight = height;
    }
  },

  render(): any {
    var style = this.props.isScrollContainer ? {overflow: 'auto'} : null;
    return (
      <div
        style={sx(this.props.style, style)}
        onScroll={this._onScroll}>
        {this.props.children}
      </div>
    );
  },
});

function getAbsoluteOffsetTop(element) {
  if (!element) {
    return 0;
  }
  return element.offsetTop + getAbsoluteOffsetTop(element.offsetParent);
}

function getWindowScrollTop() {
  if (window.pageYOffset !== undefined) {
    return window.pageYOffset;
  }

  var element: any =
    document.documentElement ||
    document.body.parentNode ||
    document.body;

  return element.scrollTop;
}

module.exports = InfiniteScroll;
