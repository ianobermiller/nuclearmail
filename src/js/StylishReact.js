/** @flow */

var React = require('react/addons');

var StylishReact = {
  createClass(config: {render: () => any}) {
    var newConfig = {
      ...config,
      render() {
        var result = this.render();

        return result;
      }
    };
    return React.createClass(newConfig);
  },

  styleSet(...styles: Array<Object>) {

  },
};

module.exports = StylishReact;
