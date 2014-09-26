/** @jsx React.DOM */

var Colors = require('./Colors');
var React = require('react');
var StyleSet = require('./StyleSet');

var PropTypes = React.PropTypes;
var cx = React.addons.classSet;

var SearchBox = React.createClass({
  propTypes: {
    onQueryChange: PropTypes.func.isRequired,
    onQuerySubmit: PropTypes.func.isRequired,
    query: PropTypes.string.isRequired,
  },

  _onQueryKeyDown(e) {
    if (e.key === 'Enter') {
      this.props.onQuerySubmit(this.props.query);
    }
  },

  _onQueryChange(e) {
    this.props.onQueryChange(e.target.value);
  },

  _onSearchClick() {
    this.props.onQuerySubmit(this.props.query);
  },

  render() /*object*/ {
    return (
      <span className={cx(this.props.className, 'SearchBox')}>
        <input
          className={Classes.input}
          value={this.props.query}
          onChange={this._onQueryChange}
          onKeyDown={this._onQueryKeyDown}
          type="search"
        />
        <button
          className={Classes.button}
          onClick={this._onSearchClick}
          type="button">
          Search
        </button>
      </span>
    );
  }
});

var {Classes, Styles} = StyleSet('SearchBox', {
  input: {
    marginRight: '8px',
    width: '400px',
  },

  button: {
    background: Colors.accent,
    color: 'white',
  },
});

module.exports = SearchBox;
