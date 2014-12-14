/** @flow */
/* global gapi */

var API = require('./API.js');
var Dispatcher = require('./Dispatcher.js');

function list() {
  return API.call(() =>
    API.execute(gapi.client.gmail.users.labels.list({userId: 'me'}))
      .then(response => response.labels)
  );
}

module.exports = {
  list,
};
