/** @flow */

var _ = require('lodash');

function styleSet(...styles: Array<?Object|boolean>): Object {
  styles = _.compact(styles);
  var style = Object.assign.apply(null, [{}].concat(styles));
  return style;
}

module.exports = styleSet;
