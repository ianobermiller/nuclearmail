/** @flow */

var Cesium = require('./Cesium');
var Colors = require('./Colors');
var React = require('react/addons');
var StylePropTypes = require('./StylePropTypes');

var PropTypes = React.PropTypes;
var PureRenderMixin = React.addons.PureRenderMixin;

var Button = React.createClass({
  propTypes: {
    onClick: PropTypes.func,
    use: PropTypes.oneOf(['default', 'special']),
    style: StylePropTypes.layout,
  },

  mixins: [PureRenderMixin],

  getDefaultProps() {
    return {
      use: 'default'
    };
  },

  _onClick() {
    this.props.onClick && this.props.onClick();
  },

  render(): any {
    return Cesium.resolveStyles(
      this,
      <button
        type="button"
        style={[
          styles.root,
          (this.props.use === 'default') && styles.default,
          (this.props.use === 'special') && styles.special,
          this.props.style
        ]}
        onClick={this._onClick}>
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

    ':active': {
      padding: '2px 15px 0 17px',
    },
  },

  default: {
    background: Colors.gray1,
    color: Colors.black,

    ':hover': {
      background: Colors.gray1.darken(5),
    },
  },

  special: {
    background: Colors.accent,
    color: Colors.white,

    ':hover': {
      background: Colors.accent.darken(5),
    },
  },
};

module.exports = Button;
