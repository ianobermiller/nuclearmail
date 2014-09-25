/** @jsx React.DOM */

var Color = require("./Color");
var RCSS = require("rcss");
var _ = require('lodash');

function StyleSet(stylesByName) {
  var result = {Classes: {}, Styles: {}};
  _.each(stylesByName, (style, name) => {
    var convertedStyle = convertColorsToString(style);

    var rcss = RCSS.registerClass(convertedStyle);
    result.Classes[name] = rcss.className;
    result.Styles[name] = rcss.style;
  });
  return result;
}

function convertColorsToString(style) {
  return _.mapValues(style, (value, key) => {
    if (value instanceof Color) {
      return value.toString();
    }

    // nested, like :hover or :after
    if (_.isObject(value)) {
      return convertColorsToString(value);
    }

    return value;
  });
}

module.exports = StyleSet;
