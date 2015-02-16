/** @flow */

var Colors = require('./Colors');
var CSSAnimation = require('./CSSAnimation');
var React = require('react/addons');

var PureRenderMixin = React.addons.PureRenderMixin;

var Spinner = React.createClass({
  mixins: [PureRenderMixin],

  render(): any {
    return (
      <div style={styles.root}>
        <div style={styles.inner} />
      </div>
    );
  }
});

var pulseAnimation = new CSSAnimation({
  '0%':   {width: '10%'},
  '50%':  {width: '50%'},
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
    WebkitAnimation: pulseAnimation + ' 3s ease 0s infinite',
    background: Colors.accent,
    height: '4px',
    margin: '0 auto',
  },
};

module.exports = Spinner;
