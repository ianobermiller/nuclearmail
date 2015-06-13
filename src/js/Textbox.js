/** @flow */

var Colors = require('./Colors');
var PureRender = require('./PureRender');
var Radium = require('radium');
var StylePropTypes = require('./StylePropTypes');
var {Component} = require('react/addons');

@PureRender
@Radium
class Textbox extends Component {
  static propTypes = {
    style: StylePropTypes.layout,
  };

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
}

var styles = {
  root: {
    boxSizing: 'border-box',
    border: '1px solid ' + Colors.gray2,
    height: 32,
    padding: '0 8px',

    ':focus': {
      outline: 'none',
      border: 'solid 1px' + Colors.gray1,
      boxShadow: '0 0 5px 0 ' + Colors.accent,
    }
  },
};

module.exports = Textbox;
