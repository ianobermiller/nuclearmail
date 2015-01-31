/** @flow */

var React = require('react');
var IntlMixin = require('react-intl').IntlMixin;
var FormattedRelative = require('react-intl').FormattedRelative;

var PropTypes = React.PropTypes;

var LONG_DATE_TIME_FORMAT = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
};

var RelativeDate = React.createClass({
  propTypes: {
    date: PropTypes.instanceOf(Date).isRequired,
  },

  mixins: [IntlMixin],

  render(): any {
    return (
      <div
        style={this.props.style}
        title={this.formatDate(this.props.date, LONG_DATE_TIME_FORMAT)}>
        <FormattedRelative value={this.props.date} />
      </div>
    );
  }
});

module.exports = RelativeDate;
