/** @flow */
/* global gapi */

import ActionType from './ActionType';
import ClientID from './ClientID';
import RSVP from 'rsvp';
import store from './store';

let isAvailable = false;
let pendingRequests = [];

RSVP.on('error', function(error) {
  console.error(error, error.stack);
});

window.handleGoogleClientLoad = function() {
  tryAuthorize(/*immediate*/ true);
};

function tryAuthorize(immediate) {
  store.dispatch({type: ActionType.Authorization.REQUEST});
  gapi.auth.authorize(
    {
      /*eslint-disable camelcase*/
      client_id: '108971935462-ied7vg89qivj0bsso4imp6imhvpuso5u.apps.googleusercontent.com',
      /*eslint-enable*/
      scope: 'email https://www.googleapis.com/auth/gmail.modify',
      immediate
    },
    whenAuthenticated
  );
}

function whenAuthenticated(authResult) {
  if (authResult && !authResult.error) {
    store.dispatch({type: ActionType.Authorization.SUCCESS});
    gapi.client.load('gmail', 'v1', whenLoaded);
  } else {
    store.dispatch({type: ActionType.Authorization.FAILURE});
  }
}

function whenLoaded() {
  isAvailable = true;
  if (pendingRequests.length) {
    pendingRequests.forEach(request => request());
  }
  pendingRequests = [];
}

function promiseGoogleApiAvailable() {
  if (isAvailable) {
    return RSVP.Promise.resolve();
  }

  return new RSVP.Promise((resolve) => {
    pendingRequests.push(resolve);
  });
}

const inProgressAPICalls = {};

/**
 * Wraps a function with API in-progress reporting and error logging.
 */
function wrap(
  getPromise: () => Promise
): Promise {
  const id = ClientID.get();
  inProgressAPICalls[id] = true;
  store.dispatch({type: ActionType.Request.START});

  const promise = promiseGoogleApiAvailable().then(() => {
    return getPromise();
  });

  promise.catch(error => console.log('API Error', error));

  return promise.finally(() => {
    delete inProgressAPICalls[id];
    if (!Object.keys(inProgressAPICalls).length) {
      store.dispatch({type: ActionType.Request.ALL_STOPPED});
    }
  });
}

function isInProgress(): boolean {
  return !!Object.keys(inProgressAPICalls).length;
}

/**
 * Executes a Google API request (anything with an execute method), turning
 * it into a promise. The promise is rejected if the response contains an
 * error field, resolved otherwise.
 */
function execute(request: GoogleAPIExecutable) {
  return new RSVP.Promise((resolve, reject) => {
    request.execute(response => {
      if (response.error) {
        console.error('API Error', response.error);
        reject(response.error);
        return;
      }

      resolve(response);
    });
  });
}

module.exports = {
  execute,
  isInProgress,
  login: tryAuthorize.bind(null, /*immediate*/ false),
  wrap,
};
