/** @flow */

var IntlMixin = require('react-intl').IntlMixin;
var FormattedRelative = require('react-intl').FormattedRelative;
var {Component, PropTypes} = require('react');

var LONG_DATE_TIME_FORMAT = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
};

class RelativeDate extends Component {
  static propTypes = {
    date: PropTypes.instanceOf(Date).isRequired,

    style: PropTypes.object,
  };

  render(): any {
    return (
      <div
        style={this.props.style}
        title={this.formatDate(this.props.date, LONG_DATE_TIME_FORMAT)}>
        <FormattedRelative value={this.props.date} />
      </div>
    );
  }
}

RelativeDate.contextTypes = IntlMixin.contextTypes;
RelativeDate.childContextTypes = IntlMixin.childContextTypes;

Object.keys(IntlMixin).forEach(key => {
  if (['propTypes', 'contextTypes'].indexOf(key) >= 0) {
    return;
  }
  RelativeDate.prototype[key] = IntlMixin[key];
});

module.exports = RelativeDate;
