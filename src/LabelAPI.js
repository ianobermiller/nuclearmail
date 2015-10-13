/** @flow */
/* global gapi */

const API = require('./API');

function list() {
  return API.wrap(() =>
    API.execute(gapi.client.gmail.users.labels.list({userId: 'me'}))
      .then(response => response.labels)
  );
}

module.exports = {
  list,
};
