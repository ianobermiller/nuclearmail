/** @jsx React.DOM */

module.exports.clearfix = {
  ':after': {
    clear: 'both',
    content: '',
    display: 'table',
  }
};

// TODO: use a JS lib like Clamp.js and do this in javascript instead
module.exports.lineClamp = (lines) => ({
  '-webkit-box-orient': 'vertical',
  display: '-webkit-box',
  '-webkit-line-clamp': lines,
  overflow : 'hidden',
  textOverflow: 'ellipsis',
});
