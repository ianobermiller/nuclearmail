/**
 * @jsx React.DOM
 *
 * Based off https://github.com/guillaumervls/react-infinite-scroll
 */

var React = require('react');

var PropTypes = React.PropTypes;

var InfiniteScroll = React.createClass({
  propTypes: {
    // Whether or not to listen for scroll and resize events. Set this to `true`
    // when you have loaded all the data already.
    hasMore: PropTypes.bool.isRequired,

    // If true, treat this element as the scroll container, and style it with
    // `overflow: auto`.
    // If false, `window` will be treated as the scroll container.
    isScrollContainer: PropTypes.bool,

    // Called when page is within `threshold` of the bottom.
    onRequestMoreItems: PropTypes.func.isRequired,
    threshold: PropTypes.number,
  },

  getDefaultProps() {
    return {
      hasMore: false,
      isScrollContainer: false,
      onRequestMoreItems: null,
      threshold: 250,
    };
  },

  componentDidMount() {
    this._attachListeners();
  },

  componentWillReceiveProps(nextProps) {
    if (!nextProps.hasMore) {
      this._detachListeners();
    }
  },

  componentWillUnmount() {
    this._detachListeners();
  },

  _getScrollNode() {
    return this.props.isScrollContainer ? this.getDOMNode() : window;
  },

  _attachListeners() {
    var scrollNode = this._getScrollNode();
    scrollNode.addEventListener('scroll', this._onScroll);
    window.addEventListener('resize', this._onScroll);
    this._onScroll();
  },

  _detachListeners() {
    var scrollNode = this._getScrollNode();
    scrollNode.removeEventListener('scroll', this._onScroll);
    window.removeEventListener('resize', this._onScroll);
  },

  render() {
    var style = this.props.isScrollContainer ? {overflow: 'auto'} : null;
    return (
      <div
        className={this.props.className}
        style={style}>
        {this.props.children}
      </div>
    );
  },

  _onScroll() {
    var el = this.getDOMNode();
    var isPastThreshold = false;
    var height = null;

    if (this.props.isScrollContainer) {
      height = el.scrollHeight;
      // ScrollTop + offsetHeight is within threshold of scrollHeight
      isPastThreshold = (el.scrollHeight -
        el.offsetHeight -
        el.scrollTop
      ) < Number(this.props.threshold);
    } else {
      height = el.offsetHeight;
      isPastThreshold = (
        getAbsoluteOffsetTop(el) +
        el.offsetHeight -
        getWindowScrollTop() -
        window.innerHeight
      ) < Number(this.props.threshold);
    }

    if ((!this.lastHeight || this.lastHeight < height) && isPastThreshold) {
      // call loadMore after _detachListeners to allow
      // for non-async loadMore functions
      this.props.onRequestMoreItems && this.props.onRequestMoreItems();
      this.lastHeight = height;
    }
  },
});

function getAbsoluteOffsetTop(element) {
  if (!element) {
    return 0;
  }
  return element.offsetTop + getAbsoluteOffsetTop(element.offsetParent);
}

function getWindowScrollTop() {
  return (window.pageYOffset !== undefined) ?
    window.pageYOffset :
    (document.documentElement ||
      document.body.parentNode ||
      document.body).scrollTop;
}

module.exports = InfiniteScroll;
