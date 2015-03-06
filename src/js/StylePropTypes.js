/** @flow */

var React = require('react');
var PropTypes = React.PropTypes;
var _ = require('lodash');

function including(
  ...names: Array<string>
): (props: Object, propName: string, componentName: string) => ?Error {
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
}

var StylePropTypes = {
  including,
  layout: including(
    'display',
    'flex',
    'float',
    'height',
    'margin',
    'marginBottom',
    'marginLeft',
    'marginRight',
    'marginTop',
    'width'
  )
};

module.exports = StylePropTypes;
