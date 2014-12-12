/** @flow */

var keyboardjs = require('keyboardjs');

var KeybindingMixin = {
  bindKey(keyCombo: string, fn: () => void) {
    this._keyBindings = this._keyBindings || [];
    this._keyBindings.push(keyboardjs.on(keyCombo, e => {
      if (['INPUT', 'TEXTAREA'].indexOf(e.target.tagName) >= 0) {
        return;
      }
      fn();
    }));
  },

  componentWillUnmount() {
    this._keyBindings && this._keyBindings.forEach(binding => binding.clear());
  }
};

module.exports = KeybindingMixin;
