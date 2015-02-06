/** @flow */

var ClientID = require('./ClientID');
var PrefixFree = require('./PrefixFree');
var _ = require('lodash');
var hyphenateStyleName = require('react/lib/hyphenateStyleName');

var style: any = document.createElement('style');
document.head.appendChild(style);

class CSSAnimation {
  _name: string;

  constructor(keyframes: Object) {
    this._name = 'Anim-' + ClientID.get();

    var rule = '@keyframes ' + this._name + ' {\n' +
      _.map(keyframes, (props, percentage) => {
        return '  ' + percentage + ' {\n' + _.map(props, (value, key) => {
          return '    ' + hyphenateStyleName(key) + ': ' + value + ';';
        }).join('\n') +
        '\n  }';
      }).join('\n') +
      '\n}\n';

    var prefixed = PrefixFree.prefixCSS(rule, /*raw*/ true);
    style.sheet.insertRule(prefixed, style.sheet.cssRules.length);
  }

  toString(): string {
    return this._name;
  }
}

module.exports = CSSAnimation;
