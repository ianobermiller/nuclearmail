/** @jsx React.DOM */

var Button = require('./Button');
var Colors = require('./Colors');
var React = require('react');
var Styles = require('./Styles');
var StyleMixin = require('./StyleMixin');

var PropTypes = React.PropTypes;
var PureRenderMixin = React.addons.PureRenderMixin;
var _ = require('lodash');
var cx = React.addons.classSet;

var Button = React.createClass({
  propTypes: {
    use: PropTypes.oneOf(['default', 'special']),
  },

  mixins: [
    PureRenderMixin,
    StyleMixin({
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
      },

      special: {
        background: Colors.accent,
        color: Colors.white,
      },
    }),
  ],

  getDefaultProps: function() {
    return {
      use: 'default'
    };
  },

  render() /*object*/ {
    return (
      <button
        type="button"
        {...this.props}
        className={cx(
          this.props.className,
          this.styles.root,
          (this.props.use === 'default') && this.styles.default,
          (this.props.use === 'special') && this.styles.special
        )}
      />
    );
  }
});

module.exports = Button;
