/** @flow */

var tinytinycolor = require('tinytinycolor');
var _ = require('lodash');

class Color {
  constructor(stringOrColor) {
    this._color = new tinytinycolor(stringOrColor);
  }

  toString(): string {
    return this._color.toHexString();
  }

  darken(val: number): Color {
    return new Color(tinytinycolor.darken(this._color, val));
  }

  lighten(val: number): Color {
    return new Color(tinytinycolor.lighten(this._color, val));
  }
}

module.exports = Color;
