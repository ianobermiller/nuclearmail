/** @jsx React.DOM */

var ClientID = require('./ClientID');
var StyleConverter = require('./StyleConverter');
var _ = require('lodash');
var autoprefixer = require('autoprefixer');

var autoprefixerInstance = autoprefixer();
var countByStyleName = {};

function StyleMixin(stylesByName) {
  var tag;
  var classesByStyleName;
  var mountedComponentCount = 0;
  var cleanupStyleTag = function() {
    mountedComponentCount--;
    if (mountedComponentCount === 0) {
      tag.parentNode.removeChild(tag);
    }
  };

  return {
    componentWillMount() {
      mountedComponentCount++;

      if (mountedComponentCount > 1) {
        this.styles = classesByStyleName;
        return;
      }

      var processedStylesByName = _.mapValues(stylesByName, processStyle);
      var classNameBase = this.constructor.displayName;
      if (countByStyleName[classNameBase]) {
        classNameBase += '-' + countByStyleName[classNameBase];
      }
      countByStyleName[classNameBase] =
        (countByStyleName[classNameBase] || 0) + 1;

      var cssRules = [];
      classesByStyleName = _.mapValues(processedStylesByName, (style, name) => {
        var className = classNameBase + '_' + name;
        var css = StyleConverter.toCssString(className, style);
        css = autoprefixerInstance.process(css);
        cssRules.push(css);
        return className;
      });
      this.styles = classesByStyleName;

      tag = document.createElement('style');
      tag.innerHTML = cssRules.join('\n');
      document.getElementsByTagName('head')[0].appendChild(tag);
    },

    componentWillUnmount() {
      setTimeout(cleanupStyleTag, 100);
    },
  };
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

module.exports = StyleMixin;
