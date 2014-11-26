/** @jsx React.DOM */

var Button = require('./Button');
var Colors = require('./Colors');
var React = require('react');
var StylePropTypes = require('./StylePropTypes');
var _ = require('lodash');
var sx = require('./styleSet');

var PropTypes = React.PropTypes;
var PureRenderMixin = React.addons.PureRenderMixin;
var cx = React.addons.classSet;

var Button = React.createClass({
  propTypes: {
    use: PropTypes.oneOf(['default', 'special']),
    style: StylePropTypes.including('margin'),
  },

  mixins: [PureRenderMixin],

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
        style={sx(
          styles.root,
          (this.props.use === 'default') && styles.default,
          (this.props.use === 'special') && styles.special,
          _.pick(this.props.style, 'margin')
        )}
      />
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
  },

  special: {
    background: Colors.accent,
    color: Colors.white,
  },
};

module.exports = Button;
