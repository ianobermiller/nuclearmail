/** @jsx React.DOM */

var _ = require('lodash');

function styleSet(...styles) {
  styles = _.compact(styles);
  var style = Object.assign.apply(null, [{}].concat(styles));
  return style;
}

module.exports = styleSet;
