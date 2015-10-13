const shallowCompare = require('react-addons-shallow-compare');

module.exports = function PureRender(Component) {
  Component.prototype.shouldComponentUpdate = function(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  };
  return Component;
};
