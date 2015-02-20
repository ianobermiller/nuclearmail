/** @flow */

var Colors = require('./Colors');
var InteractiveStyleMixin = require('./InteractiveStyleMixin');
var React = require('react/addons');
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
        <ul style={styles.list}>
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
    InteractiveStyleMixin(['active', 'hover']),
  ],

  _onClick(event) {
    this.props.onQueryChanged(this.props.query);
    event.preventDefault();
  },

  render() /*object*/ {
    return (
      <li>
        <a
          {...this.interactions.getProps({onClick: this._onClick})}
          style={sx(
            styles.item.link,
            this.interactions.isHovering() && styles.item.linkHover,
            this.interactions.isActive() && styles.item.linkActive,
            this.props.isSelected && styles.item.linkSelected
          )}
          href="#">
          {this.props.label}
        </a>
      </li>
    );
  }
});

var styles = {
  list: {
    display: 'flex',
  },

  item: {
    link: {
      color: Colors.gray4,
      display: 'block',
      padding: '16px',
      textDecoration: 'none',
      verticalAlign: 'bottom',
    },

    linkHover: {
      color: Colors.black,
    },

    linkActive: {
      padding: '18px 14px 14px 18px',
    },

    linkSelected: {
      color: Colors.accent,
      cursor: 'default',
      padding: '16px',
    },
  }
};

module.exports = Nav;

