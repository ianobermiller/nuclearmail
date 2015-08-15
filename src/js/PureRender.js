const shallowEqual = require('react/lib/shallowEqual');

module.exports = function PureRender(Component) {
  Component.prototype.shouldComponentUpdate = function(nextProps, nextState) {
    return (
      !shallowEqual(this.props, nextProps) ||
      !shallowEqual(this.state, nextState)
    );
  };
  return Component;
};
