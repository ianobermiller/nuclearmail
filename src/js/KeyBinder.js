var keyboardjs = require('keyboardjs');

module.exports = function decorateWithKeyBinding(ComposedComponent) {
  class KeybinderEnhancer extends ComposedComponent {
    bindKey(keyCombo: string, fn: () => void) {
      this._keyBindings = this._keyBindings || [];
      this._keyBindings.push(keyboardjs.on(keyCombo, e => {
        if (['INPUT', 'TEXTAREA'].indexOf(e.target.tagName) >= 0) {
          return;
        }
        fn();
      }));
    }

    componentWillUnmount() {
      if (super.componentWillUnmount) {
        super.componentWillUnmount();
      }

      if (this._keyBindings) {
        this._keyBindings.forEach(binding => binding.clear());
      }
    }
  }

  KeybinderEnhancer.defaultProps = ComposedComponent.defaultProps;
  KeybinderEnhancer.propTypes = ComposedComponent.propTypes;
  KeybinderEnhancer.contextTypes = ComposedComponent.contextTypes;

  return KeybinderEnhancer;
};
