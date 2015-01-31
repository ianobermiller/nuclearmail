/**
 * @flow
 *
 * A helper for making mixins that can take arguments and have
 * per-component state.
 *
 * Returns a function that can be used as a mixin constructor. The function
 * returns a mixin that, on getInitialState, creates an instance of your mixin
 * class, passing in the component as the first argument and whatever arguments
 * were passed into the function following. Each instance of the component will
 * get a unique instance of the mixin class, so you can freely use `this` to
 * store state. All methods starting with a letter are added to the mixin and
 * proxied to the instance (e.g. componentWillMount will be called as usual).
 * Note that lifecycle methods will have the mixin instance as the `this`
 * pointer, not the component, which should be saved in the constructor.
 *
 * Example:
 *
 *   class FooMixin {
 *     constructor(component, bar) {
 *       this._component = component;
 *       this._bar = bar;
 *     }
 *
 *     getInitialState() {
 *       return {
 *         bar: this._bar;
 *       };
 *     }
 *
 *     componentWillMount() {
 *       console.log('Mounted!', this._component);
 *     }
 *   }
 *   module.exports = classToMixinFunction(FooMixin);
 *
 *   var FooMixin = require('./FooMixin');
 *   var SomeComponent = React.createClass({
 *     mixins: [FooMixin('bar')];
 *   });
 */

var ClientID = require('./ClientID');

function classToMixinFunction(constructor: any): Function {
  return function() {
    var mixinArgs = arguments;
    var mixinID = '_mixin_' + ClientID.get();

    var getInstance = function(component) {
      if (component[mixinID]) {
        return component[mixinID];
      }

      // Create a new instance of the mixin with the component and the
      // passed-in args and stash it on the component
      // We could just do this once in getInitialstate, but react-hot-loader
      // will blow away the non-state props on a component, so it is safer to
      // create a new instance whenever we can't find one.
      var instance = Object.create(constructor.prototype);
      var args = [component].concat(Array.prototype.slice.call(mixinArgs));
      constructor.apply(instance, args);
      component[mixinID] = instance;
      return instance;
    };

    var mixin = {
      getInitialState() {
        var instance = getInstance(this);

        // Return mixin defined getInitialState if any
        return instance.getInitialState ? instance.getInitialState() : {};
      }
    };

    Object.getOwnPropertyNames(constructor.prototype).forEach(prop => {
      if (
        prop === 'constructor' ||
        // getInitialState is handled above
        prop === 'getInitialState' ||
        // ignore "private" functions, or anything not starting with a letter
        !/^[a-zA-Z]/.test(prop) ||
        // ignore anything that isn't a function
        typeof constructor.prototype[prop] !== 'function'
      ) {
        return;
      }

      // For each function defined in the prototype, create a function
      // to proxy the call to the mixin instance.
      mixin[prop] = (function(prop) { return function() {
        var mixinInstance = getInstance(this);
        return mixinInstance[prop].apply(mixinInstance, arguments);
      }})(prop);
    });

    return mixin;
  };
}

module.exports = classToMixinFunction;
