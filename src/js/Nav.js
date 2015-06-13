/** @flow */

var Colors = require('./Colors');
var Radium = require('radium');
var PureRender = require('./PureRender');
var {Component, PropTypes} = require('react/addons');

@PureRender
@Radium
class Nav extends Component {
  static propTypes = {
    onQueryChanged: PropTypes.func.isRequired,
    query: PropTypes.string,
  };

  render(): any {
    return (
      <nav>
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
              isSelected={this.props.query === config.query}
              key={config.label}
              label={config.label}
              onQueryChanged={this.props.onQueryChanged}
              query={config.query}
            />
          )}
        </ul>
      </nav>
    );
  }
}

@PureRender
@Radium
class NavItem extends Component {
  static propTypes = {
    label: PropTypes.string.isRequired,
    onQueryChanged: PropTypes.func.isRequired,
    query: PropTypes.string.isRequired,

    isSelected: PropTypes.bool,
  };

  _onClick = (event) => {
    this.props.onQueryChanged(this.props.query);
    event.preventDefault();
  };

  render() {
    return (
      <li>
        <a
          href="#"
          onClick={this._onClick}
          style={[
            styles.item.link,
            this.props.isSelected && styles.item.linkSelected
          ]}>
          {this.props.label}
        </a>
      </li>
    );
  }
}

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

      ':hover': {
        color: Colors.black,
      },

      ':active': {
        padding: '18px 14px 14px 18px',
      },
    },

    linkSelected: {
      color: Colors.accent,
      cursor: 'default',
      padding: '16px',

      ':hover': {
        color: Colors.accent,
      },
    },
  }
};

module.exports = Nav;
