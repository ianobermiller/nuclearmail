/** @jsx React.DOM */

var ClientID = require('./ClientID');
var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');
var classToMixinFunction = require('./classToMixinFunction');

var emitter = new EventEmitter();

document.body.addEventListener('mouseup', event => {
  emitter.emit('mouseup', event);
});

class InteractiveStyleMixin {
  constructor(component, config) {
    this._component = component;
    this._config = config;
    this._component.interactions =
      _.mapValues(config, (requestedInteractions, interactionID) => {
        var interaction = {props: {}};
        if (
          requestedInteractions.indexOf('hover') !== -1 ||
          requestedInteractions.indexOf('active') !== -1
        ) {
          interaction.props.onMouseEnter = () => {
            this._setState(interactionID, {
              isHovering: true,
              isActive: this._getState(interactionID, 'isMouseDown'),
            });
          };

          interaction.props.onMouseLeave = () => {
            this._setState(interactionID, {
              isHovering: false,
              isActive: false,
            });
          };

          interaction.isHovering = () => {
            return this._getState(interactionID, 'isHovering');
          };
        }

        if (requestedInteractions.indexOf('active') !== -1) {
          interaction.props.onMouseUp = () => {
            this._setState(interactionID, {
              isActive: false,
              isMouseDown: false,
            });
          };

          interaction.props.onMouseDown = () => {
            this._setState(interactionID, {
              isActive: true,
              isMouseDown: true,
            });
          };

          // Sometimes a quick tap registers the mousedown and up events
          // at the same time, and the active state never renders.
          interaction.props.onClick = () => {
            this._setState(interactionID, {
              isActive: true,
              isMouseDown: true,
            });

            setTimeout(() => {
              this._setState(interactionID, {
                isActive: false,
                isMouseDown: false,
              });
            }, 100);
          };

          interaction.isActive = () => {
            return this._getState(interactionID, 'isActive');
          };
        }
        interaction.props.onMouseUp &&
          emitter.addListener('mouseup', interaction.props.onMouseUp);
        return interaction;
      });
  }

  componentWillUnmount() {
    _.forEach(this._component.interactions, (interaction, interactionID) => {
      interaction.props.onMouseUp &&
        emitter.removeListener('mouseup', interaction.props.onMouseUp);
    });
  }

  _setState(interactionID, newInteractionState) {
    var state = {};
    var interactionState = (this._component.state || {})[interactionID] || {};

    if (_.isEqual(interactionState, newInteractionState)) {
      return;
    }

    interactionState = {...interactionState, ...newInteractionState};
    state[interactionID] = interactionState;
    this._component.setState(state);
  }

  _getState(interactionID, name) {
    return ((this._component.state || {})[interactionID] || {})[name];
  }
}

function defaultGetOptions() {
  return {};
}

module.exports = classToMixinFunction(InteractiveStyleMixin);
