/** @jsx React.DOM */

var Colors = require('./Colors');
var React = require('react');
var StyleMixin = require('./StyleMixin');
var Styles = require('./Styles');

var PropTypes = React.PropTypes;
var PureRenderMixin = React.addons.PureRenderMixin;
var cx = React.addons.classSet;

var Nav = React.createClass({
  propTypes: {
    onQueryChanged: PropTypes.func.isRequired,
    query: PropTypes.string,
  },

  mixins: [
    PureRenderMixin,
    StyleMixin({
      list: Styles.clearfix,
    }),
  ],

  render() {
    return (
      <nav>
        <ul className={this.styles.list}>
          {[{
            label: 'INBOX',
            query: 'in:inbox',
          }, {
            label: 'IMPORTANT',
            query: 'is:important',
          }, {
            label: 'UNREAD',
            query: 'is:unread',
          }, {
            label: 'STARRED',
            query: 'is:starred',
          }, {
            label: 'SENT',
            query: 'in:sent',
          }, {
            label: 'DRAFTS',
            query: 'is:draft',
          }].map(config =>
            <NavItem
              label={config.label}
              query={config.query}
              key={config.label}
              onQueryChanged={this.props.onQueryChanged}
              isSelected={this.props.query === config.query}
            />
          )}
        </ul>
      </nav>
    );
  }
});

var NavItem = React.createClass({
  propTypes: {
    onQueryChanged: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
    query: PropTypes.string.isRequired,
    isSelected: PropTypes.bool
  },

  mixins: [
    PureRenderMixin,
    StyleMixin({
      root: [{
        float: 'left',
      }, Styles.clearfix],

      link: {
        color: Colors.gray3,
        display: 'block',
        padding: '16px',
        textDecoration: 'none',

        ':hover': {
          color: Colors.black,
        },
      },

      linkSelected: {
        color: Colors.accent,
        cursor: 'default',

        ':hover': {
          color: Colors.accent,
        }
      }
    }),
  ],

  _onClick(event) {
    this.props.onQueryChanged(this.props.query);
    event.preventDefault();
  },

  render() /*object*/ {
    return (
      <li className={this.styles.root}>
        <a
          className={cx(
            this.styles.link,
            this.props.isSelected && this.styles.linkSelected
          )}
          href="#"
          onClick={this._onClick}>
          {this.props.label}
        </a>
      </li>
    );
  }
});

module.exports = Nav;

