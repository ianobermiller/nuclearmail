/**
 * @flow
 */

var RSVP = require('rsvp');
var React = require('react/addons');
var _ = require('lodash');
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
    this._pendingState = {};
  }

  _createSubscriptions(props, state) {
    var stores = _.chain(this._config).map(
      (stateConfig, stateFieldName) => stateConfig.method.store
    ).compact().uniq().value();

    this._batchStateUpdates(() => {
      _.forEach(this._config, (stateConfig, stateFieldName) => {
        var options = stateConfig.getOptions(props, state);
        this._callMethod(stateConfig, stateFieldName, options);
      });
    });

    this._subscriptions = stores.map(
      store => store.subscribe(this._onStoreChange)
    );
  }

  _onStoreChange(data) {
    this._batchStateUpdates(() => {
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
    });
  }

  _callMethod(stateConfig, stateFieldName, options) {
    this._optionsByStateFieldName[stateFieldName] = options;

    if (stateConfig.shouldFetch && !stateConfig.shouldFetch(options)) {
      return null;
    }

    var result = stateConfig.method(options);
    if (result instanceof Promise || result instanceof RSVP.Promise) {
      console.assert(false, 'Stores should not return promises anymore.');
    }

    this._pendingState[stateFieldName] = result;
  }

  _batchStateUpdates(updateFunc) {
    updateFunc();

    if (!_.isEmpty(this._pendingState)) {
      this._component.setState(this._pendingState);
    }
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
    // TODO: this breaks pretty much everything
    // You aren't allowed to setState in componentWillUpdate. :(
    // http://facebook.github.io/react/docs/component-specs.html#updating-componentwillupdate
    // this._batchStateUpdates(() => {
    //   _.forEach(this._config, (stateConfig, stateFieldName) => {
    //     var newOptions = stateConfig.getOptions(nextProps, nextState);
    //     var oldOptions = this._optionsByStateFieldName[stateFieldName];

    //     if (!_.isEqual(newOptions, oldOptions)) {
    //       this._callMethod(stateConfig, stateFieldName, newOptions);
    //     }
    //   });
    // });
  }

  componentDidMount() {
    this._pendingState = {};
  }

  componentDidUpdate() {
    this._pendingState = {};
  }

  getInitialState() {
    return _.mapValues(this._config, (stateConfig, stateFieldName) => null);
  }
}

function defaultGetOptions() {
  return {};
}

module.exports = classToMixinFunction(DependentStateMixin);
