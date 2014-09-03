/** @jsx React.DOM */

var React = require('react');

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
      <div className={cx(this.props.className, 'SearchBox')}>
        <input
          className="SearchBox_input"
          value={this.props.query}
          onChange={this._onQueryChange}
          onKeyDown={this._onQueryKeyDown}
          type="search"
        />
        <button
          className="SearchBox_button"
          onClick={this._onSearchClick}
          type="button">
          Search
        </button>
      </div>
    );
  }
});

module.exports = SearchBox;
