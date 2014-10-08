/** @jsx React.DOM */

// https://github.com/leoselig/jsFancyScroll/

var Colors = require('./Colors');
var React = require('react');
var StyleSet = require('./StyleSet');

var PropTypes = React.PropTypes;
var cx = React.addons.classSet;
var PureRenderMixin = React.addons.PureRenderMixin;

var Scroller = React.createClass({
  mixins: [PureRenderMixin],

  getInitialState() /*object*/ {
    return {
      scrollTop: 0,
      scrollHeight: 1,
      offsetHeight: 1,
    };
  },

  componentDidMount() {
    this._attachListeners();
  },

  componentWillUnmount() {
    this._detachListeners();
  },

  _attachListeners() {
    window.addEventListener('resize', this._onScroll);
    this._onScroll();
  },

  _detachListeners() {
    window.removeEventListener('resize', this._onScroll);
  },

  _onScroll() {
    var viewport = this.refs.viewport.getDOMNode();
    this.setState({
      scrollTop: viewport.scrollTop,
      scrollHeight: viewport.scrollHeight,
      offsetHeight: viewport.offsetHeight,
    });
  },

  render() /*object*/ {
    var thumbHeight = this.state.offsetHeight / this.state.scrollHeight * this.state.offsetHeight;
    var thumbTop = this.state.scrollTop / this.state.scrollHeight * this.state.offsetHeight;

    return (
      <div className={this.props.className + ' ' + Classes.scroller}>
        <div className={Classes.scrollbar}>
          <div className={Classes.thumb} style={{height: thumbHeight, top: thumbTop}} />
        </div>
        <div
          className={Classes.viewport}
          onScroll={this._onScroll}
          ref="viewport">
          <div className={Classes.content}>
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
});

var scrollBarWidth = '15px';
var {Classes, Styles} = StyleSet('Scroller', {
  scroller: {
    overflow: 'hidden',
    position: 'relative',
  },

  scrollbar: {
    bottom: 0,
    opacity: 0,
    position: 'absolute',
    right: '1px',
    top: 0,
    transition: 'opacity .25s',
    width: '6px',
  },

  // TODO: this is hacky!
  'scroller:hover .Scroller_scrollbar': {
    opacity: 1,
  },

  thumb: {
    background: 'rgba(0, 0, 0, .4)',
    borderRadius: '2px',
    position: 'absolute',
    right: '1px',
    width: '4px',
  },

  viewport: {
    height: '100%',
    marginRight: '-' + scrollBarWidth,
    overflowX: 'hidden',
    overflowY: 'scroll',
    paddingRight: scrollBarWidth,
    width: '100%',
  },

  content: {
    marginRight: '-' + scrollBarWidth,
  },
});

module.exports = Scroller;
