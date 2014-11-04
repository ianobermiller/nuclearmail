/** @jsx React.DOM */

var Color = require('./Color');
var _ = require('lodash');

var Colors = _.mapValues(
  {
    accent: '#ff6817',
    black: '#000',
    gray1: '#eee',
    gray2: '#ccc',
    gray3: '#666',
    white: '#fff',
  },
  value => new Color(value)
);

window.Color = Color;

module.exports = Colors;
