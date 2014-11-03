/** @jsx React.DOM */
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

function ruleToString(keyframeNameMap, propName, value) {
  var cssPropName = hyphenateProp(propName);
  var value = escapeValueForProp(value, cssPropName);
  if (cssPropName.contains('animation')) {
    _.forEach(keyframeNameMap, (newkeyframeName, oldkeyframeName) => {
      if (value.contains(oldkeyframeName)) {
        value = value.replace(oldkeyframeName, newkeyframeName);
      }
    });
  }
  return cssPropName + ': ' + value + ';\n';
}

function getkeyframeNameMap(className, styles) {
  var keyframeNames = Object.keys(styles)
    .filter(key => key.startsWith('@keyframes'))
    .map(key => key.split(' ')[1]);
  return _.object(
    keyframeNames,
    keyframeNames.map(name => className + '_' + name)
  );
}

function rulesToString(className, styles) {
  var keyframeNameMap = getkeyframeNameMap(className, styles);
  console.log(keyframeNameMap);
  var markup = '';
  var pseudos = '';
  var mediaQueries = '';
  var keyframes = '';

  for (var key in styles) {
    if (!styles.hasOwnProperty(key)) {
      continue;
    }

    if (key[0] === ':') {
      pseudos += '\n.' + className + key + ' {\n' +
        _.map(styles[key], (v, k) => '  ' + ruleToString(keyframeNameMap, k, v)).join('') + '}';
    } else if (key.startsWith('@media')) {
      mediaQueries += '\n' + key + ' {\n' +
        rulesToString(className, styles[key]);
    } else if (key.startsWith('@keyframes')) {
      var keyframeName = key.split(' ')[1];
      var newkeyframeName = keyframeNameMap[keyframeName];
      keyframes += '\n @keyframes ' + newkeyframeName + ' {\n' +
        _.map(styles[key], (styles, percentage) => {
          return '  ' + percentage + ' {\n' +
            _.map(styles, (v, k) => '    ' + ruleToString(keyframeNameMap, k, v)).join('') +
            '  }';
        }).join('\n') + '\n}';
    } else {
      markup += '  ' + ruleToString(keyframeNameMap, key, styles[key]);
    }
  }

  if (markup !== '') {
    markup = '.' + className + ' {\n' + markup + '}';
  }

  return markup + pseudos + mediaQueries + keyframes;
}

module.exports = {
  toCssString: rulesToString
};
