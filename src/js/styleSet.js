/** @jsx React.DOM */

var _ = require('lodash');

function styleSet(...styles) {
  styles = _.compact(styles);
  return Object.assign.apply(null, styles);
}

module.exports = styleSet;
