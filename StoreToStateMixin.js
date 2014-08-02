/**
 * @providesModule StoreToStateMixin
 * @jsx React.DOM
 */

var _ = require('lodash');

function StoreToStateMixin(config) {
  var subscriptions = null;
  return {
    componentWillMount() {
      subscriptions = _.map(config, (storeMethod, stateFieldName) => {
        return storeMethod(this.props, this.state).subscribe(data => {
          var state = {};
          var fieldState = state[stateFieldName] =
            this.state[stateFieldName] || {};
          fieldState.isLoading = data.isLoading;
          if (!data.isLoading) {
            fieldState.value = data.value;
          }
          this.setState(state);
        });
      });
    },

    componentWillUnmount() {
      subscriptions && subscriptions.forEach(sub => sub.remove());
      subscriptions = null;
    },

    getInitialState() {
      return _.mapValues(config, (storeMethod, stateFieldName) => ({
        isLoading: true,
        value: null,
      }));
    }
  };
}

module.exports = StoreToStateMixin;
