/** @flow */
/* global gapi */

var ActionType = require('./ActionType.js');
var API = require('./API.js');
var Dispatcher = require('./Dispatcher.js');
var Message = require('./Message');
var MessageTranslator = require('./MessageTranslator');
var RSVP = require('rsvp');
var _ = require('lodash');

function getByIDs(
  options: {ids: Array<string>}
): Promise<Array<Message>> {
  return API.wrap(() => {
    var batch = gapi.client.newHttpBatch();
    options.ids.forEach(id => {
      batch.add(
        gapi.client.gmail.users.messages.get({userId: 'me', id}),
        {id}
      );
    });
    return API.execute(batch).then(
      response => options.ids.map(messageID => response[messageID].result)
    );
  });
}

module.exports = {
  getByIDs,
};
