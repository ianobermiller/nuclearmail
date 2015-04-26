/** @flow */

var Colors = require('./Colors');
var Radium = require('Radium');
var React = require('react/addons');
var StylePropTypes = require('./StylePropTypes');

var PureRenderMixin = React.addons.PureRenderMixin;

var Textbox = React.createClass(Radium.wrap({
  propTypes: {
    style: StylePropTypes.layout,
  },

  mixins: [PureRenderMixin],

  render(): any {
    return (
      <input
        {...this.props}
        style={[
          styles.root,
          this.props.style
        ]}
      />
    );
  }
}));

var styles = {
  root: {
    border: '1px solid ' + Colors.gray2,
    height: 32,
    padding: '0 4px',

    ':focus': {
      outline: 'none',
      border: 'solid 1px' + Colors.gray1,
      boxShadow: '0 0 5px 0 ' + Colors.accent,
    }
  },
};

module.exports = Textbox;
