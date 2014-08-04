/**
 * @providesModule StoreToStateMixin
 * @jsx React.DOM
 */

var _ = require('lodash');

function StoreToStateMixin(config) {
  var subscriptionsByStateFieldName = null;
  var optionsByStateFieldName = {};

  var subscriber = function(component, stateFieldName, data) {
    var state = {};
    var fieldState = state[stateFieldName] =
      component.state[stateFieldName] || {};
    fieldState.isLoading = data.isLoading;
    if (!data.isLoading) {
      fieldState.value = data.value;
    }
    component.setState(state);
  };

  var createsubscriptions = function(component, props, state) {
    subscriptionsByStateFieldName =
      _.mapValues(config, (getStateConfig, stateFieldName) => {
        var stateConfig = getStateConfig(props, state);
        var options = optionsByStateFieldName[stateFieldName] =
          stateConfig.options;

        return stateConfig.method(options).subscribe(
          subscriber.bind(null, component, stateFieldName)
        );
      });
  };

  var removesubscriptions = function() {
    subscriptionsByStateFieldName &&
      _.forEach(subscriptionsByStateFieldName, sub => sub.remove());
    subscriptionsByStateFieldName = null;
  };

  return {
    componentWillMount() {
      createsubscriptions(this, this.props, this.state);
    },

    componentWillUpdate(nextProps, nextState) {
      _.forEach(config, (getStateConfig, stateFieldName) => {
        var stateConfig = getStateConfig(nextProps, nextState);
        var newOptions = stateConfig.options;
        var oldOptions = optionsByStateFieldName[stateFieldName];

        if (!_.isEqual(newOptions, oldOptions)) {
          optionsByStateFieldName[stateFieldName] = newOptions;
          subscriptionsByStateFieldName[stateFieldName].remove();
          subscriptionsByStateFieldName[stateFieldName] =
            stateConfig.method(newOptions).subscribe(
              subscriber.bind(null, this, stateFieldName)
            );
        }
      });
    },

    componentWillUnmount() {
      removesubscriptions();
    },

    getInitialState() {
      return _.mapValues(config, (getStateConfig, stateFieldName) => ({
        isLoading: true,
        value: null,
      }));
    }
  };
}

module.exports = StoreToStateMixin;
