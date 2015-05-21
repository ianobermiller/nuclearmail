function _resubscribe(component, props) {
  var newObservables = component.observe(props);
  var newSubscriptions = {};

  Object.keys(newObservables).forEach(key => {
    newSubscriptions[key] = newObservables[key].subscribe(
      function onNext(value) {
        component.data[key] = value;

        if (component.data[key] != component._observerLastData[key]) { //eslint-disable-line eqeqeq
          component._observerCalledForceUpdate = true;
          component.forceUpdate();
        }

        component._observerLastData[key] = value;
      },
      function onError() { },
      function onCompleted() { },
    );
  });

  _unsubscribe(component);
  component._observerSubscriptions = newSubscriptions;
}

function _unsubscribe(component) {
  Object.keys(component._observerSubscriptions).forEach(
    key => component._observerSubscriptions[key].dispose()
  );

  component._observerSubscriptions = {};
}

module.exports = function decorateWithObserve(ComposedComponent) {
  class ObserveEnhancer extends ComposedComponent {
    constructor(props) {
      super(props);

      if (this.observe){
        this.data = {};
        this._observerSubscriptions = {};
        this._observerLastData = {};
        _resubscribe(this, props);
      }
    }

    componentWillUpdate(newProps) {
      if (super.componentWillUpdate) {
        super.componentWillUpdate(newProps);
      }

      if (!this._observerCalledForceUpdate && this.observe) {
        _resubscribe(this, newProps);
      }
    }

    componentDidUpdate(prevProps, prevState) {
      if (super.componentDidUpdate) {
        super.componentDidUpdate(prevProps, prevState);
      }

      this._observerCalledForceUpdate = false;
    }

    componentWillReceiveProps(newProps) {
      if (super.componentWillReceiveProps) {
        super.componentWillReceiveProps(newProps);
      }

      if (this.observe){
        _resubscribe(this, newProps);
      }
    }

    componentWillUnmount() {
      if (super.componentWillUnmount) {
        super.componentWillUnmount();
      }

      if (this._observerSubscriptions){
        _unsubscribe(this);
      }
    }
  }

  ObserveEnhancer.defaultProps = ComposedComponent.defaultProps;
  ObserveEnhancer.propTypes = ComposedComponent.propTypes;
  ObserveEnhancer.contextTypes = ComposedComponent.contextTypes;

  return ObserveEnhancer;
};
