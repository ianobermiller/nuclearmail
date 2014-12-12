/** @flow */

var React = require('react');
var moment = require('moment');

var PropTypes = React.PropTypes;

var RelativeDate = React.createClass({
  propTypes: {
    date: PropTypes.instanceOf(Date).isRequired,
  },

  render(): any {
    return (
      <div
        style={this.props.style}
        title={moment(this.props.date).format('llll')}>
        {moment(this.props.date).fromNow()}
      </div>
    );
  }
});

module.exports = RelativeDate;
