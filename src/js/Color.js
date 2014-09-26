/** @jsx React.DOM */

// TODO: use tinytinycolor?
var Colr = require('colr');
var _ = require('lodash');

class Color {
  constructor(stringOrColr) {
    this._colr = _.isString(stringOrColr) ?
      Colr.fromHex(stringOrColr) :
      stringOrColr;
  }

  toString() {
    return this._colr.toHex();
  }

  darken(val) {
    return new Color(this._colr.clone().darken(val));
  }

  lighten(val) {
    return new Color(this._colr.clone().lighten(val));
  }
}

module.exports = Color;
