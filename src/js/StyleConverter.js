/* Lifted mostly as-is from RCSS */

var _ = require('lodash');

var _uppercasePattern = /([A-Z])/g;
var msPattern = /^ms-/;

function hyphenateProp(string) {
  // MozTransition -> -moz-transition
  // msTransition -> -ms-transition. Notice the lower case m
  // http://modernizr.com/docs/#prefixed
  // thanks a lot IE
  return string.replace(_uppercasePattern, '-$1')
    .toLowerCase()
    .replace(msPattern, '-ms-');
}

function escapeValueForProp(value, prop) {
  // 'content' is a special property that must be quoted
  if (prop === 'content') {
    return '"' + value + '"';
  }
  return _.escape(value);
}

function ruleToString(propName, value) {
  var cssPropName = hyphenateProp(propName);
  return cssPropName + ': ' + escapeValueForProp(value, cssPropName) + ';';
}

function _rulesToStringHeadless(styleObj) {
  var markup = '';

  for (var key in styleObj) {
    if (!styleObj.hasOwnProperty(key)) {
      continue;
    }

    if (key[0] === ':' || key.substring(0, 6) === '@media') {
      continue;
    }
    markup += '  ' + ruleToString(key, styleObj[key]) + '\n';
  }
  return markup;
}

function rulesToString(className, styleObj) {
  var markup = '';
  var pseudos = '';
  var mediaQueries = '';

  for (var key in styleObj) {
    if (!styleObj.hasOwnProperty(key)) {
      continue;
    }
    // Skipping the special pseudo-selectors and media queries.
    if (key[0] === ':') {
      pseudos += '\n.' + className + key + ' {\n' +
        _rulesToStringHeadless(styleObj[key]) + '}';
    } else if (key.substring(0, 6) === '@media') {
      mediaQueries += '\n' + key + ' {\n' +
        rulesToString(className, styleObj[key]);
    } else {
      markup += '  ' + ruleToString(key, styleObj[key]) + '\n';
    }
  }

  if (markup !== '') {
    markup = '.' + className + ' {\n' + markup + '}';
  }

  return markup + pseudos + mediaQueries;
}

module.exports = {
  toCssString: rulesToString
};
