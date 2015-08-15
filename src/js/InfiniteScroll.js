/**
 * @flow
 *
 * Based off https://github.com/guillaumervls/react-infinite-scroll
 */

const Radium = require('radium');
const {Component, PropTypes, findDOMNode} = require('react');

@Radium
class InfiniteScroll extends Component {
  static propTypes = {
    // Whether or not to listen for scroll and resize events. Set this to `true`
    // when you have loaded all the data already.
    hasMore: PropTypes.bool.isRequired,
    // Called when page is within `threshold` of the bottom.
    onRequestMoreItems: PropTypes.func.isRequired,
    onScroll: PropTypes.func.isRequired,
    threshold: PropTypes.number.isRequired,

    children: PropTypes.node,
    isScrollContainer: PropTypes.bool,
    style: PropTypes.object,
  };

  static defaultProps = {
    hasMore: false,
    isScrollContainer: false,
    onRequestMoreItems: () => {},
    threshold: 250,
  };

  componentDidMount() {
    this._attachListeners();
  }

  componentWillReceiveProps(nextProps: Object) {
    if (!nextProps.hasMore) {
      this._detachListeners();
    }
  }

  componentWillUnmount() {
    this._detachListeners();
  }

  _attachListeners() {
    window.addEventListener('resize', this._update);
    this._update();
  }

  _detachListeners() {
    window.removeEventListener('resize', this._update);
  }

  _onScroll = (event: Event) => {
    this.props.onScroll(event);
    this._update();
  };

  _lastHeight = 0;

  _update = () => {
    const el = findDOMNode(this);
    const height = el.scrollHeight;
    // ScrollTop + offsetHeight is within threshold of scrollHeight
    const isPastThreshold = (el.scrollHeight -
      el.offsetHeight -
      el.scrollTop
    ) < Number(this.props.threshold);

    if ((!this._lastHeight || this._lastHeight < height) && isPastThreshold) {
      // call loadMore after _detachListeners to allow
      // for non-async loadMore functions
      this.props.onRequestMoreItems();
      this._lastHeight = height;
    }
  };

  render(): any {
    const style = this.props.isScrollContainer ? {overflow: 'auto'} : null;
    return (
      <div
        onScroll={this._onScroll}
        style={[this.props.style, style]}>
        {this.props.children}
      </div>
    );
  }
}

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

  const element: any =
    document.documentElement ||
    document.body.parentNode ||
    document.body;

  return element.scrollTop;
}

module.exports = InfiniteScroll;
