/** @jsx React.DOM */
/* global gapi */

var ClientID = require('./ClientID.js');
var Dispatcher = require('./Dispatcher.js');
var EventEmitter = require('events').EventEmitter;
var RSVP = require('rsvp');
var emitter = new EventEmitter();
var isAvailable = false;
var pendingRequests = [];

window.handleGoogleClientLoad = function() {
  tryAuthorize(/*immediate*/ true);
};

function tryAuthorize(immediate) {
  var config = {
    client_id: '108971935462-ied7vg89qivj0bsso4imp6imhvpuso5u.apps.googleusercontent.com',
    scope: 'email https://www.googleapis.com/auth/gmail.modify',
    immediate
  };
  gapi.auth.authorize(config, whenAuthenticated);
}

function whenAuthenticated(authResult) {
  if (authResult && !authResult.error) {
    emitter.emit('isAuthorized', true);
    gapi.client.load('gmail', 'v1', whenLoaded);
  } else {
    emitter.emit('isAuthorized', false);
  }
}

function whenLoaded() {
  isAvailable = true;
  if (pendingRequests.length) {
    pendingRequests.forEach(request => request());
  }
  pendingRequests = [];
}

function whenGoogleApiAvailable(fn) {
  if (isAvailable) {
    fn();
  } else {
    pendingRequests.push(fn);
  }
}

function simpleAPICall(getRequest) {
  return wrapAPICallWithEmitter(options => {
    return new RSVP.Promise((resolve, reject) => {
      whenGoogleApiAvailable(() => {
        var request = getRequest(options);

        request.execute(response => {
          if (!handleError(response, reject)) {
            return;
          }

          resolve(response);
        });
      });
    });
  });
}

var inProgressAPICalls = {};
function wrapAPICallWithEmitter(apiCall) {
  return function(options) {
    var id = ClientID.get();
    inProgressAPICalls[id] = true;
    emitter.emit('start', id);

    var promise = apiCall(options);

    promise.catch(error => console.log('API Error', error));

    return promise.finally(() => {
      delete inProgressAPICalls[id];
      emitter.emit('stop', id);
      if (!Object.keys(inProgressAPICalls).length) {
        emitter.emit('allStopped');
      }
    });
  };
}

function isInProgress() {
  return !!Object.keys(inProgressAPICalls).length;
}

function subscribe(eventName, callback) {
  emitter.on(eventName, callback);
  return {
    remove() {
      emitter.removeListener(eventName, callback);
    }
  };
}

function handleError(response, reject) {
  if (response.error) {
    console.error('API Error', response.error);
    reject(response.error);
    return false;
  }
  return true;
}

module.exports = {
  handleError,
  isInProgress,
  login: tryAuthorize.bind(null, /*immediate*/ false),
  simpleAPICall,
  subscribe,
  whenGoogleApiAvailable,
  wrapAPICallWithEmitter,
};
