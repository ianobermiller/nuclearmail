/** @jsx React.DOM */

var Color = require("./Color");
var RCSS = require("rcss");
var _ = require('lodash');
var autoprefixer = require('autoprefixer');

// TODO: convert to mixin so the RCSS generated name can include the component
function StyleSet(stylesByName) {
  var result = {Classes: {}, Styles: {}};
  _.each(stylesByName, (style, name) => {
    var convertedStyle = processStyle(style);

    var rcss = RCSS.registerClass(convertedStyle);
    result.Classes[name] = rcss.className;
    result.Styles[name] = rcss.style;
  });
  return result;
}

function processStyle(style) {
  if (Array.isArray(style)) {
    var processedStyles = style.map(processStyle);
    return Object.assign.apply(null, [{}].concat(processedStyles));
  }

  return _.mapValues(style, (value, key) => {
    if (value instanceof Color) {
      return value.toString();
    }

    // nested, like :hover or :after
    if (_.isObject(value)) {
      return processStyle(value);
    }

    return value;
  });
}

StyleSet.injectStyles = () => {
  var ap = autoprefixer();
  var tag = document.createElement('style');
  tag.innerHTML = ap.process(RCSS.getStylesString());
  document.getElementsByTagName('head')[0].appendChild(tag);
};

StyleSet.clearfix = {
  ':after': {
    clear: 'both',
    content: '',
    display: 'table',
  }
};

// TODO: use a JS lib like Clamp.js and do this in javascript instead
StyleSet.lineClamp = (lines) => ({
  '-webkit-box-orient': 'vertical',
  display: '-webkit-box',
  '-webkit-line-clamp': lines,
  overflow : 'hidden',
  textOverflow: 'ellipsis',
});

module.exports = StyleSet;
