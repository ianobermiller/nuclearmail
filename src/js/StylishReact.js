/** @flow */

var React = require('react/addons');
var invariant = require('react/lib/invariant');

var cloneWithProps = React.addons.cloneWithProps;

var StylishReact = {
  createClass(config: any) {
    var newConfig = {
      ...config,
      getInitialState() {
        var initialState = config.getInitialState ?
          config.getInitialState.call(this) :
          {};
        return {
          ...initialState,
          _styleState: {},
        };
      },

      render() {
        var result = config.render.call(this);
        var props = result.props;
        var style = props.style;
        if (!style) {
          return result;
        }

        var key = result.key;
        invariant(key, 'key is required');

        var newStyle = {...style};
        if (style[':hover']) {
          var existingOnMouseEnter = props.onMouseEnter;
          props.onMouseEnter = (e) => {
            existingOnMouseEnter && existingOnMouseEnter(e);
            this._setStyleState(key, {
              isHovering: true,
              isActive: this._getStyleState(key, 'isMouseDown'),
            });
          };

          var existingOnMouseLeave = props.onMouseLeave;
          props.onMouseLeave = (e) => {
            existingOnMouseLeave && existingOnMouseLeave(e);
            this._setStyleState(key, {isHovering: false, isActive: false});
          };

          var existingOnMouseDown = props.onMouseDown;
          props.onMouseDown = (e) => {
            console.log('mousedown');
            existingOnMouseDown && existingOnMouseDown(e);
            this._setStyleState(key, {isActive: true, isMouseDown: true});
          };

          var existingOnMouseUp = props.onMouseUp;
          props.onMouseUp = (e) => {
            console.log('mouseup');
            existingOnMouseUp && existingOnMouseUp(e);
            this._setStyleState(key, {isActive: false, isMouseDown: false});
          };

          // Sometimes a quick tap registers the mousedown and up events
          // at the same time, and the active state never renders. Handle the
          // click event also to cover this case.
          // var existingOnClick = props.onClick;
          // props.onClick = (e) => {
          //   console.log('click');
          //   existingOnClick && existingOnClick(e);
          //   this._setStyleState(key, {isActive: true, isMouseDown: true});

          //   setTimeout(() => {
          //     this._setStyleState(key, {isActive: false, isMouseDown: false});
          //   }, 100);
          // };

          if (this._getStyleState(key, 'isHovering')) {
            Object.assign(newStyle, style[':hover']);
          }

          if (this._getStyleState(key, 'isActive')) {
            Object.assign(newStyle, style[':active']);
          }
        }

        result.props.style = newStyle;

        return result;
      },

      _getStyleState(key: string, value: string) {
        return this.state &&
          this.state._styleState &&
            this.state._styleState[key] &&
              this.state._styleState[key][value];
      },

      _setStyleState(key: string, newState: Object) {
        var state = {_styleState: {...this.state._styleState}};
        state._styleState[key] = state._styleState[key] || {};
        Object.assign(state._styleState[key], newState);
        this.setState(state);
      }
    };
    return React.createClass(newConfig);
  },
  styleSet,
};

function styleSet(...styles: Array<Object|boolean>): any {
  var styleProp = {
    ':active': {},
    ':hover': {},
  };

  styles.forEach(style => {
    if (!style || typeof style !== 'object') {
      return;
    }

    var styleObj: Object = style; // flow :(

    Object.keys(styleObj).forEach(name => {
      if ([':hover', ':active'].indexOf(name) >= 0) {
        Object.assign(styleProp[name], styleObj[name]);
      } else {
        styleProp[name] = styleObj[name];
      }
    });
  });

  return styleProp;
}

module.exports = StylishReact;
