/**
 * @flow
 */

var _ = require('lodash');
var classToMixinFunction = require('./classToMixinFunction');

class StoreToStateMixin {
  _subscriptions: Array<{remove: () => void;}>;

  constructor(component, config) {
    this._component = component;
    this._config = _.mapValues(config, stateConfig => {
      return Object.assign({getOptions: defaultGetOptions}, stateConfig);
    });
    this._optionsByStateFieldName = {};
    this._onStoreChange = this._onStoreChange.bind(this);
  }

  _onResult(stateFieldName, result) {
    var state = {};
    var fieldState = state[stateFieldName] =
      _.clone(this._component.state[stateFieldName]) || {};
    fieldState.isLoading = false;
    fieldState.result = result;
    this._component.setState(state);
  }

  _createSubscriptions(props, state) {
    var stores = _.chain(this._config).map(
      (stateConfig, stateFieldName) => stateConfig.method.store
    ).uniq().value();

    _.forEach(this._config, (stateConfig, stateFieldName) => {
      var options = stateConfig.getOptions(props, state);
      this._callMethod(stateConfig, stateFieldName, options);
    });

    this._subscriptions = _.uniq(stores)
      .map(store => store.subscribe(this._onStoreChange));
  }

  _onStoreChange(data) {
    _.forEach(this._config, (stateConfig, stateFieldName) => {
      if (stateConfig.method.store !== data.store) {
        return;
      }

      var options = stateConfig.getOptions(
        this._component.props,
        this._component.state
      );
      this._callMethod(stateConfig, stateFieldName, options);
    });
  }

  _callMethod(stateConfig, stateFieldName, options) {
    this._optionsByStateFieldName[stateFieldName] = options;

    if (stateConfig.shouldFetch && !stateConfig.shouldFetch(options)) {
      return;
    }

    stateConfig.method(options)
      .then(this._onResult.bind(this, stateFieldName))
      ['catch'](error => console.error(error, error.getStack()));
  }

  componentWillMount() {
    this._createSubscriptions(
      this._component.props,
      this._component.state
    );
  }

  componentWillUnmount() {
    this._subscriptions.forEach(subscription => subscription.remove());
  }

  componentWillUpdate(nextProps, nextState) {
    _.forEach(this._config, (stateConfig, stateFieldName) => {
      var newOptions = stateConfig.getOptions(nextProps, nextState);
      var oldOptions = this._optionsByStateFieldName[stateFieldName];

      if (!_.isEqual(newOptions, oldOptions)) {
        this._callMethod(stateConfig, stateFieldName, newOptions);
      }
    });
  }

  getInitialState() {
    return _.mapValues(this._config, (stateConfig, stateFieldName) => ({
      isLoading: true,
      result: null,
    }));
  }
}

function defaultGetOptions() {
  return {};
}

module.exports = classToMixinFunction(StoreToStateMixin);
