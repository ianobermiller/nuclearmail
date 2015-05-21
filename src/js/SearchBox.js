/** @flow */

var Button = require('./Button');
var Textbox = require('./Textbox');
var {Component, PropTypes} = require('react');

class SearchBox extends Component {
  static propTypes = {
    onQueryChange: PropTypes.func.isRequired,
    onQuerySubmit: PropTypes.func.isRequired,
    query: PropTypes.string.isRequired,

    style: PropTypes.object,
  };

  _onQueryKeyDown = (e: Object) => {
    if (e.key === 'Enter') {
      this.props.onQuerySubmit(this.props.query);
    }
  };

  _onQueryChange = (e: Object) => {
    this.props.onQueryChange(e.target.value);
  };

  _onSearchClick = () => {
    this.props.onQuerySubmit(this.props.query);
  };

  render(): any {
    return (
      <span style={this.props.style}>
        <Textbox
          onChange={this._onQueryChange}
          onKeyDown={this._onQueryKeyDown}
          style={styles.input}
          type="search"
          value={this.props.query}
        />
        <Button
          onClick={this._onSearchClick}
          use="special">
          Search
        </Button>
      </span>
    );
  }
}

var styles = {
  input: {
    marginRight: '8px',
    width: '400px',
  },
};

module.exports = SearchBox;
