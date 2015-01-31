/**
 * @flow
 */

var RSVP = require('rsvp');
var React = require('react/addons');
var _ = require('lodash');
var asap = require('asap');
var classToMixinFunction = require('./classToMixinFunction');

class DependentStateMixin {
  _subscriptions: Array<{remove: () => void;}>;

  constructor(component, config) {
    this._component = component;
    this._config = _.mapValues(config, stateConfig => {
      return {getOptions: defaultGetOptions, ...stateConfig};
    });
    this._optionsByStateFieldName = {};
    this._onStoreChange = this._onStoreChange.bind(this);
  }

  _createSubscriptions(props, state) {
    var stores = _.chain(this._config).map(
      (stateConfig, stateFieldName) => stateConfig.method.store
    ).compact().uniq().value();

    this._update(props, state);

    this._subscriptions = stores.map(
      store => store.subscribe(this._onStoreChange)
    );
  }

  _onStoreChange(data) {
    this._update(
      this._component.props,
      this._component.state,
      data.store
    );
  }

  _update(props, state, store) {
    var newState = {};

    var isFirstRound = true;
    var didOptionsChange = true;
    while (didOptionsChange) {
      didOptionsChange = false;
      _.forEach(this._config, (stateConfig, stateFieldName) => {
        var newOptions = stateConfig.getOptions(props, {...state, ...newState});
        var oldOptions = this._optionsByStateFieldName[stateFieldName];

        if (
          !_.isEqual(newOptions, oldOptions) ||
          (isFirstRound && store && stateConfig.method.store === store)
        ) {
          didOptionsChange = true;
          var result = this._callMethod(stateConfig, stateFieldName, newOptions);
          newState[stateFieldName] = result;
        }
      });
      isFirstRound = false;
    }

    if (this._component.isMounted() && !_.isEmpty(newState)) {
      this._component.setState(newState);
    }
  }

  _callMethod(stateConfig, stateFieldName, options): any {
    this._optionsByStateFieldName[stateFieldName] = options;

    if (stateConfig.shouldFetch && !stateConfig.shouldFetch(options)) {
      return null;
    }

    var result = stateConfig.method(options);
    if (result instanceof Promise || result instanceof RSVP.Promise) {
      console.assert(false, 'Stores should not return promises anymore.');
    }

    return result;
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
    asap(() => {
      this._update(nextProps, nextState);
    });
  }

  getInitialState() {
    return _.mapValues(this._config, (stateConfig, stateFieldName) => null);
  }
}

function defaultGetOptions() {
  return {};
}

module.exports = classToMixinFunction(DependentStateMixin);
