/** @jsx React.DOM */

var Colors = require('./Colors');
var InteractiveStyleMixin = require('./InteractiveStyleMixin');
var React = require('react');
var StylePropTypes = require('./StylePropTypes');
var sx = require('./styleSet');

var PropTypes = React.PropTypes;
var PureRenderMixin = React.addons.PureRenderMixin;
var cx = React.addons.classSet;

var Button = React.createClass({
  propTypes: {
    onClick: PropTypes.func,
    use: PropTypes.oneOf(['default', 'special']),
    style: StylePropTypes.layout,
  },

  mixins: [
    PureRenderMixin,
    InteractiveStyleMixin({
      button: ['hover', 'active'],
    })
  ],

  getDefaultProps() {
    return {
      use: 'default'
    };
  },

  _onClick() {
    this.props.onClick && this.props.onClick();
    this.interactions.button.props.onClick();
  },

  render() /*object*/ {
    var interaction = this.interactions.button;
    return (
      <button
        type="button"
        {...this.interactions.button.props}
        onClick={this._onClick}
        style={sx(
          styles.root,
          (this.props.use === 'default') && styles.default,
          (this.props.use === 'default' && interaction.isHovering()) &&
            styles.defaultHover,
          (this.props.use === 'special') && styles.special,
          (this.props.use === 'special' && interaction.isHovering()) &&
            styles.specialHover,
          interaction.isActive() && styles.active,
          this.props.style
        )}>
        {this.props.children}
      </button>
    );
  }
});

var styles = {
  root: {
    border: 'none',
    borderRadius: '2px',
    cursor: 'pointer',
    lineHeight: '30px',
    margin: 0,
    padding: '1px 16px',
    verticalAlign: 'top',
  },

  active: {
    padding: '2px 15px 0 17px',
  },

  default: {
    background: Colors.gray1,
    color: Colors.black,
  },

  defaultHover: {
    background: Colors.gray1.darken(5),
  },

  special: {
    background: Colors.accent,
    color: Colors.white,
  },

  specialHover: {
    background: Colors.accent.darken(5),
  },
};

module.exports = Button;
