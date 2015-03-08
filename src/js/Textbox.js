/** @flow */

var Cesium = require('./Cesium');
var Colors = require('./Colors');
var React = require('react/addons');
var StylePropTypes = require('./StylePropTypes');

var PureRenderMixin = React.addons.PureRenderMixin;

var Textbox = React.createClass(Cesium.wrap({
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
    border: 'solid 1px' + Colors.gray2,
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
