/**
 * @providesModule StoreToStateMixin
 * @jsx React.DOM
 */

var _ = require('lodash');

function StoreToStateMixin(config) {
  var subscriptionsByStateFieldName = null;
  var optionsByStateFieldName = {};

  var onResult = function(component, stateFieldName, result) {
    var state = {};
    var fieldState = state[stateFieldName] =
      component.state[stateFieldName] || {};
    fieldState.isLoading = false;
    fieldState.result = result;
    component.setState(state);
  };

  var createsubscriptions = function(component, props, state) {
    _.forEach(config, (stateConfig, stateFieldName) => {
      var options = optionsByStateFieldName[stateFieldName] =
        stateConfig.getOptions(props, state);

      stateConfig.method(options).then(
        onResult.bind(null, component, stateFieldName)
      );
    });
  };

  return {
    componentWillMount() {
      createsubscriptions(this, this.props, this.state);
    },

    componentWillUpdate(nextProps, nextState) {
      _.forEach(config, (stateConfig, stateFieldName) => {
        var newOptions = stateConfig.getOptions(nextProps, nextState);
        var oldOptions = optionsByStateFieldName[stateFieldName];

        if (!_.isEqual(newOptions, oldOptions)) {
          optionsByStateFieldName[stateFieldName] = newOptions;
          stateConfig.method(newOptions).then(
            onResult.bind(null, this, stateFieldName)
          );
        }
      });
    },

    getInitialState() {
      return _.mapValues(config, (stateConfig, stateFieldName) => ({
        isLoading: true,
        result: null,
      }));
    }
  };
}

module.exports = StoreToStateMixin;
