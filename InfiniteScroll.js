/**
 * @jsx React.DOM
 *
 * Based off https://github.com/guillaumervls/react-infinite-scroll
 */

var React = require('react');

var PropTypes = React.PropTypes;

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

var InfiniteScroll = React.createClass({
  propTypes: {
    hasMore: PropTypes.bool.isRequired,
    onRequestMoreItems: PropTypes.func.isRequired,
    threshold: PropTypes.number,
  },

  getDefaultProps() {
    return {
      hasMore: false,
      onRequestMoreItems: null,
      threshold: 250,
    };
  },

  componentDidMount() {
    this._attachScrollListener();
  },

  componentWillReceiveProps(nextProps) {
    if (!nextProps.hasMore) {
      this._detachScrollListener();
    }
  },

  componentWillUnmount() {
    this._detachScrollListener();
  },

  _attachScrollListener() {
    window.addEventListener('scroll', this._onScroll);
    window.addEventListener('resize', this._onScroll);
    this._onScroll();
  },

  _detachScrollListener() {
    window.removeEventListener('scroll', this._onScroll);
    window.removeEventListener('resize', this._onScroll);
  },

  render() {
    return <div>{this.props.children}</div>;
  },

  _onScroll() {
    var el = this.getDOMNode();
    var scrollTop = getWindowScrollTop();
    if ((!this.lastOffsetHeight || this.lastOffsetHeight < el.offsetHeight) &&
      getAbsoluteOffsetTop(el) + el.offsetHeight - scrollTop - window.innerHeight < Number(this.props.threshold)) {
      // call loadMore after _detachScrollListener to allow
      // for non-async loadMore functions
      this.props.onRequestMoreItems && this.props.onRequestMoreItems();
      this.lastOffsetHeight = el.offsetHeight;
    }
  },
});

module.exports = InfiniteScroll;
