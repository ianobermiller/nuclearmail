/** @flow */

var Colors = require('./Colors');
var PureRender = require('./PureRender');
var Radium = require('radium');
var {Component} = require('react/addons');

@Radium.Enhancer
@PureRender
class Spinner extends Component {
  render(): any {
    return (
      <div style={styles.root}>
        <div style={styles.inner} />
      </div>
    );
  }
}

var pulseKeyframes = Radium.keyframes({
  '0%': {width: '10%'},
  '50%': {width: '50%'},
  '100%': {width: '10%'},
});

var styles = {
  root: {
    left: 0,
    position: 'fixed',
    top: 0,
    width: '100%',
    zIndex: 10000,
  },

  inner: {
    animation: pulseKeyframes + ' 3s ease 0s infinite',
    background: Colors.accent,
    height: '4px',
    margin: '0 auto',
  },
};

module.exports = Spinner;
