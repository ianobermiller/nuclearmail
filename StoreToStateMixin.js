/**
 * @providesModule StoreToStateMixin
 * @jsx React.DOM
 */

var _ = require('lodash');

function StoreToStateMixin(config) {
  var optionsByStateFieldName = {};

  var onResult = function(component, stateFieldName, result) {
    var state = {};
    var fieldState = state[stateFieldName] =
      _.clone(component.state[stateFieldName]) || {};
    fieldState.isLoading = false;
    fieldState.result = result;
    component.setState(state);
  };

  var createsubscriptions = function(component, props, state) {
    _.forEach(config, (stateConfig, stateFieldName) => {
      var options = stateConfig.getOptions(props, state);
      callMethod(component, stateConfig, stateFieldName, options);
    });
  };

  var callMethod = function(component, stateConfig, stateFieldName, options) {
    optionsByStateFieldName[stateFieldName] = options;

    stateConfig.method(options)
      .then(onResult.bind(null, component, stateFieldName))
      ['catch'](error => console.error(error));
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
          callMethod(this, stateConfig, stateFieldName, newOptions);
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
