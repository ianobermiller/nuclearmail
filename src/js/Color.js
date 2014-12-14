/** @flow */

// TODO: use tinytinycolor?
var Colr = require('colr');
var _ = require('lodash');

class Color {
  constructor(stringOrColr) {
    this._colr = _.isString(stringOrColr) ?
      Colr.fromHex(stringOrColr) :
      stringOrColr;
  }

  toString(): string {
    return this._colr.toHex();
  }

  darken(val: number): Color {
    return new Color(this._colr.clone().darken(val));
  }

  lighten(val: number): Color {
    return new Color(this._colr.clone().lighten(val));
  }
}

module.exports = Color;
