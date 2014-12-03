/** @jsx React.DOM */

var React = require('react');
var PropTypes = React.PropTypes;
var _ = require('lodash');

var StylePropTypes = {
  including(...names) {
    return function(props, propName, componentName) {
      var style = props[propName];
      if (!style) {
        return;
      }

      var err = PropTypes.object(props, propName, componentName);
      if (err) {
        return err;
      }

      var invalidKeys = _.difference(Object.keys(style), names);

      if (invalidKeys.length) {
        return new Error(
          'Invalid props on style object: ' + invalidKeys.join(', ')
        );
      }
    };
  },
};

StylePropTypes.layout = StylePropTypes.including(
  'display',
  'flex',
  'float',
  'margin',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'marginTop'
);

module.exports = StylePropTypes;
