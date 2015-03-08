/** @flow */

var CSSPropertyOperations = require('react/lib/CSSPropertyOperations');
var React = require('react/addons');
var camelizeStyleName = require('react/lib/camelizeStyleName');
var cssVendor = require('css-vendor');
var hyphenateStyleName = require('react/lib/hyphenateStyleName');
var invariant = require('react/lib/invariant');

var components = [];

//
// The nucleus of Cesium. resolveStyles is called on the rendered elements
// before they are returned in render. It iterates over the elements and
// children, rewriting props to add event handlers required to capture user
// interactions (e.g. mouse over). It also replaces the style prop because it
// adds in the various interaction styles (e.g. :hover) and performs vendor
// prefixing.
//
function resolveStyles(
  component: any,
  renderedElement: any,
  existingKeyMap?: {[key: string]: bool;}
): any {
  existingKeyMap = existingKeyMap || {};

  // Recurse over children first in case we bail early. Could be optimized to be
  // iterative if needed. Note that children only include those rendered in
  // `this` component. Child nodes in other components will not be here, so each
  // component needs to use Cesium.
  if (renderedElement.props.children) {
    React.Children.forEach(
      renderedElement.props.children,
      child => {
        if (React.isValidElement(child)) {
          resolveStyles(component, child, existingKeyMap);
        }
      }
    );
  }

  var props = renderedElement.props;
  var style = props.style;

  // Convenient syntax for multiple styles: `style={[style1, style2, etc]}`
  // Ignores non-objects, so you can do `this.state.isCool && styles.cool`.
  if (Array.isArray(style)) {
    props.style = style = _mergeStyles(...style);
  }

  // Bail early if no interactive styles.
  if (!style || !Object.keys(style).some(k => k.indexOf(':') === 0)) {
    if (style) {
      // Still perform vendor prefixing, though.
      props.style = _prefix(props.style);
    }
    return renderedElement;
  }

  var newStyle = {...style};

  // We need a unique key to correlate state changes due to user interaction
  // with the rendered element, so we know to apply the proper interactive
  // styles.
  var originalKey = renderedElement.ref || renderedElement.key;
  var key = originalKey || 'main';

  invariant(
    !existingKeyMap[key],
    'Cesium requires each element with interactive styles to have a unique ' +
      'key, set using either the ref or key prop. ' +
      (originalKey ?
        'Key "' + originalKey + '" is a duplicate.' :
        'Multiple elements have no key specified.')
  );

  existingKeyMap[key] = true;

  // Only add handlers if necessary
  if (style[':hover'] || style[':active']) {
    // Always call the existing handler if one is already defined.
    // This code, and the very similar ones below, could be abstracted a bit
    // more, but it hurts readability IMO.
    var existingOnMouseEnter = props.onMouseEnter;
    props.onMouseEnter = (e) => {
      existingOnMouseEnter && existingOnMouseEnter(e);
      _setStyleState(component, key, {
        isHovering: true,
        isActive: _getStyleState(component, key, 'isMouseDown'),
      });
    };

    var existingOnMouseLeave = props.onMouseLeave;
    props.onMouseLeave = (e) => {
      existingOnMouseLeave && existingOnMouseLeave(e);
      _setStyleState(component, key, {isHovering: false, isActive: false});
    };

    var existingOnMouseDown = props.onMouseDown;
    props.onMouseDown = (e) => {
      existingOnMouseDown && existingOnMouseDown(e);
      component._lastMouseDown = Date.now();
      _setStyleState(component, key, {isActive: true, isMouseDown: true});
    };

    var existingOnMouseUp = props.onMouseUp;
    props.onMouseUp = (e) => {
      existingOnMouseUp && existingOnMouseUp(e);
      component._lastMouseUp = Date.now();
      _setStyleState(component, key, {isActive: false, isMouseDown: false});
    };

    // Merge in the styles if needed
    if (_getStyleState(component, key, 'isHovering')) {
      Object.assign(newStyle, style[':hover']);
    }

    if (_getStyleState(component, key, 'isActive')) {
      Object.assign(newStyle, style[':active']);
    }
  }

  if (style[':focus']) {
    var existingOnFocus = props.onFocus;
    props.onFocus = (e) => {
      existingOnFocus && existingOnFocus(e);
      _setStyleState(component, key, {isFocused: true});
    };

    var existingOnBlur = props.onBlur;
    props.onBlur = (e) => {
      existingOnBlur && existingOnBlur(e);
      _setStyleState(component, key, {isFocused: false});
    };

    if (_getStyleState(component, key, 'isFocused')) {
      Object.assign(newStyle, style[':focus']);
    }
  }

  if (style[':active'] && components.indexOf(component) === -1) {
    components.push(component);
  }

  props.style = _prefix(newStyle);

  return renderedElement;
}

function _getStyleState(component: any, key: string, value: string) {
  return component.state &&
    component.state._styleState &&
      component.state._styleState[key] &&
        component.state._styleState[key][value];
}

function _setStyleState(component: any, key: string, newState: Object) {
  var existing = (component.state && component.state._styleState) || {};
  var state = {_styleState: {...existing}};
  state._styleState[key] = state._styleState[key] || {};
  Object.assign(state._styleState[key], newState);
  component.setState(state);
}

// Merge style objects. Special casing for props starting with ';'; the values
// should be objects, and are merged with others of the same name (instead of
// overwriting).
function _mergeStyles(...styles: Array<Object|boolean>): any {
  var styleProp = {};

  styles.forEach(style => {
    if (!style || typeof style !== 'object') {
      return;
    }

    var styleObj: Object = style; // flow :(

    Object.keys(styleObj).forEach(name => {
      if (name.indexOf(':') === 0) {
        styleProp[name] = styleProp[name] || {};
        Object.assign(styleProp[name], styleObj[name]);
      } else {
        styleProp[name] = styleObj[name];
      }
    });
  });

  return styleProp;
}

function _prefix(style: Object) {
  var newStyle = {};
  Object.keys(style).filter(key => key.indexOf(':') !== 0).forEach(key => {
    var value = style[key];

    // Have to go back and forth because cssVendor only accepts hyphenated
    var newKey = cssVendor.supportedProperty(hyphenateStyleName(key));
    if (newKey === false) {
      // Ignore unsupported properties
      console.warn('Unsupported CSS property ' + key);
      return;
    }
    newKey = camelizeStyleName(newKey);
    var newValue = cssVendor.supportedValue(newKey, value);
    if (newValue === false) {
      // Allow unsupported values, since css-vendor will say something like:
      // `solid 1px black` is not supported because the browser rewrites it to
      // `1px solid black`. css-vendor should be smarter about this.
      newValue = value;
    }
    newStyle[newKey] = newValue;
  });
  return newStyle;
}

// More convenient syntax than using resolveStyles at every return, particularly
// if you use early returns to short-circuit, since you only have to wrap once.
function wrap(config: {render: () => any;}): any {
  return {
    ...config,
    render() {
      var renderedElement = config.render.call(this);
      return resolveStyles(this, renderedElement);
    }
  };
}

//
// Animations using keyframes
//
var animationIndex = 1;
var animationStyleSheet: any = document.createElement('style');
document.head.appendChild(animationStyleSheet);

// Test if prefix needed for keyframes (copied from PrefixFree)
var keyframesPrefixed = 'keyframes';
animationStyleSheet.textContent = '@keyframes {}';
if (!animationStyleSheet.sheet.cssRules.length) {
  keyframesPrefixed = cssVendor.prefix.css + 'keyframes';
}

// Simple animation helper that injects CSS into a style object containing the
// keyframes, and returns a string with the generated animation name.
function animation(keyframes: Object): string {
  var name = 'Animation' + animationIndex;
  animationIndex += 1;

  var rule = '@' + keyframesPrefixed + ' ' + name + ' {\n' +
    Object.keys(keyframes).map((percentage) => {
      var props = keyframes[percentage];
      var serializedProps = CSSPropertyOperations.createMarkupForStyles(
        _prefix(props)
      );
      return '  ' + percentage + ' {\n  ' + serializedProps + '\n  }';
    }).join('\n') +
    '\n}\n';

  animationStyleSheet.sheet.insertRule(
    rule,
    animationStyleSheet.sheet.cssRules.length
  );
  return name;
}

// Listen for mouseup events on the body so we can disable active states when
// you mouse down, move away, and mouse up.
document.body.addEventListener('mouseup', () => {
  components.forEach((component, index) => {

    // Since we can't hook into React's lifecycle methods if you just use
    // resolveStyles, we need some way to know when we should release the
    // references to the components.
    if (!component.isMounted()) {
      components.splice(index, 1);
      return;
    }

    if (!component.state || !component.state._styleState) {
      return;
    }

    Object.keys(component.state._styleState).forEach(key => {
      if (component.state._styleState[key].isMouseDown) {
        _setStyleState(component, key, {isActive: false, isMouseDown: false});
      }
    });
  });
});

module.exports = {
  animation,
  resolveStyles,
  wrap
};
