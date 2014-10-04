/** @jsx React.DOM */
/* global gapi */

var API = require('./API.js');
var Dispatcher = require('./Dispatcher.js');
var RSVP = require('rsvp');

var list = API.wrapAPICallWithEmitter(function() {
  return new RSVP.Promise((resolve, reject) => {
    API.whenGoogleApiAvailable(() => {
      var request = gapi.client.gmail.users.labels.list({
        userId: 'me',
      });

      request.execute(response => {
        if (!API.handleError(response, reject)) {
          return;
        }

        resolve(response.labels);
      });
    });
  });
});

module.exports = {
  list
};
