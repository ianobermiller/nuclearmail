/** @flow */

var Colors = require('./Colors');
var InteractiveStyleMixin = require('./InteractiveStyleMixin');
var React = require('react');
var sx = require('./styleSet');

var PropTypes = React.PropTypes;
var PureRenderMixin = React.addons.PureRenderMixin;

var Nav = React.createClass({
  propTypes: {
    onQueryChanged: PropTypes.func.isRequired,
    query: PropTypes.string,
  },

  mixins: [PureRenderMixin],

  render(): any {
    return (
      <nav style={this.props.style}>
        <ul>
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
          }, {
            label: 'ALL',
            query: '',
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
    InteractiveStyleMixin({
      link: ['hover'],
    }),
  ],

  _onClick(event) {
    this.props.onQueryChanged(this.props.query);
    event.preventDefault();
  },

  render() /*object*/ {
    return (
      <li style={styles.item.root}>
        <a
          {...this.interactions.link.props}
          style={sx(
            styles.item.link,
            this.interactions.link.isHovering() && styles.item.linkHover,
            this.props.isSelected && styles.item.linkSelected
          )}
          href="#"
          onClick={this._onClick}>
          {this.props.label}
        </a>
      </li>
    );
  }
});

var styles = {
  item: {
    root: {
      display: 'inline-block',
    },

    link: {
      color: Colors.gray4,
      display: 'block',
      padding: '16px',
      textDecoration: 'none',
    },

    linkHover: {
      color: Colors.black,
    },

    linkSelected: {
      color: Colors.accent,
      cursor: 'default',
    },
  }
};

module.exports = Nav;

