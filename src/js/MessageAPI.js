/** @flow */
/* global gapi */

var ActionType = require('./ActionType.js');
var API = require('./API.js');
var Dispatcher = require('./Dispatcher.js');
var MessageTranslator = require('./MessageTranslator');
var RSVP = require('rsvp');
var _ = require('lodash');

function getByIDs(
  options: {ids: array<string>}
): Promise<array<Object>> {
  return API.wrap(() => {
    var batch = gapi.client.newHttpBatch();
    ids.forEach(id => {
      batch.add(
        gapi.client.gmail.users.messages.get({userId: 'me', id}),
        {id}
      );
    });
    return API.execute(batch).then(
      response => ids.map(messageID => batchResponse[messageID].result)
    );
  });
}

module.exports = {
  getByIDs,
};
