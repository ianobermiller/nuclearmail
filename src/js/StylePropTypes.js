/** @flow */

const React = require('react');
const PropTypes = React.PropTypes;
const _ = require('lodash');

function including(
  ...names: Array<string>
): (props: Object, propName: string, componentName: string) => ?Error {
  return function(props, propName, componentName) {
    const style = props[propName];
    if (!style) {
      return null;
    }

    const err = PropTypes.object(props, propName, componentName);
    if (err) {
      return err;
    }

    const invalidKeys = _.difference(Object.keys(style), names);

    if (invalidKeys.length) {
      return new Error(
        'Invalid props on style object: ' + invalidKeys.join(', ')
      );
    }
  };
}

const StylePropTypes = {
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
