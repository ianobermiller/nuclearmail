/** @flow */

var React = require('react/addons');
var clamp = require('./clamp');

var PropTypes = React.PropTypes;
var PureRenderMixin = React.addons.PureRenderMixin;

var ThreadView = React.createClass({
  propTypes: {
    lines: PropTypes.number.isRequired
  },

  mixins: [PureRenderMixin],

  componentDidMount() {
    clamp(this.refs.content.getDOMNode(), {clamp: this.props.lines});
  },

  render(): any {
    return (
      <div ref="content">
        {this.props.children}
      </div>
    );
  }
});

module.exports = ThreadView;
