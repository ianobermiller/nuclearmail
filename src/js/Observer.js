module.exports = function decorateWithObserve(ComposedComponent) {
  class ObserveEnhancer extends ComposedComponent {
    constructor(props, context) {
      super(props, context);

      if (this.observe){
        this._subscriptions = {};
        this.data = {};
        this._resubscribe(props, context);
      }
    }

    componentWillReceiveProps(newProps, newContext) {
      if (super.componentWillReceiveProps) {
        super.componentWillReceiveProps(newProps, newContext);
      }

      if (this.observe){
        this._resubscribe(newProps, newContext);
      }
    }

    componentWillUnmount() {
      if (super.componentWillUnmount) {
        super.componentWillUnmount();
      }

      if (this._subscriptions){
        this._unsubscribe();
      }
    }

    _resubscribe(props, context) {
      var newObservables = this.observe(props, context);
      var newSubscriptions = {};
      var that = this;

      Object.keys(newObservables).forEach(key => {
        newSubscriptions[key] = newObservables[key].subscribe(
          function onNext(value) {
            that.data[key] = value;
            that.forceUpdate();
          },
          function onError() { },
          function onCompleted() { },
        );
      });

      this._unsubscribe();
      this._subscriptions = newSubscriptions;
    }

    _unsubscribe() {
      Object.keys(this._subscriptions).forEach(
        key => this._subscriptions[key].dispose()
      );

      this._subscriptions = {};
    }
  }

  ObserveEnhancer.propTypes = ComposedComponent.propTypes;
  ObserveEnhancer.contextTypes = ComposedComponent.contextTypes;

  return ObserveEnhancer;
};
