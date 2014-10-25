/** @jsx React.DOM */
/* global gapi */

var ActionType = require('./ActionType.js');
var API = require('./API.js');
var Dispatcher = require('./Dispatcher.js');
var MessageTranslator = require('./MessageTranslator');
var RSVP = require('rsvp');
var _ = require('lodash');

var list = API.wrapAPICallWithEmitter(function(options) {
  return new RSVP.Promise((resolve, reject) => {
    API.whenGoogleApiAvailable(() => {
      var request = gapi.client.gmail.users.threads.list({
        userId: 'me',
        maxResults: options.maxResults,
        q: options.query || null,
        pageToken: options.pageToken || null,
      });

      request.execute(response => {
        if (!API.handleError(response, reject)) {
          return;
        }

        var threadIDs = (response.threads || []).map(m => m.id);

        if (!threadIDs.length) {
          resolve({
            nextPageToken: null,
            resultSizeEstimate: 0,
            items: [],
          });
          return;
        }

        var batch = gapi.client.newHttpBatch();
        threadIDs.forEach(id => {
          batch.add(
            gapi.client.request({
              path: 'gmail/v1/users/me/threads/' + id
            }),
            {id}
            // TODO: file a task, this is broken :(
            // dump(gapi.client.gmail.users.messages.get({id: message.id}))
          );
        });

        batch.execute(itemsResponse => {
          if (!API.handleError(response, reject)) {
            return;
          }

          var allMessages = [];
          var threads = threadIDs.map(threadID => {
            var thread = itemsResponse[threadID].result;
            var messages = thread.messages.map(MessageTranslator.translate);
            allMessages.push.apply(allMessages, messages);
            return {
              id: threadID,
              messageIDs: _.pluck(messages, 'id'),
            };
          });

          Dispatcher.dispatch({
            type: ActionType.Message.ADD_MANY,
            messages: allMessages,
          });

          resolve({
            nextPageToken: response.nextPageToken,
            resultSizeEstimate: response.resultSizeEstimate,
            items: threads,
          });
        });
      });
    });
  });
});

var markAsRead = API.simpleAPICall(options => {
  return gapi.client.gmail.users.threads.modify({
    userId: 'me',
    id: options.threadID,
    removeLabelIds: ['UNREAD'],
  });
});

var archive = API.simpleAPICall(options => {
  return gapi.client.gmail.users.threads.modify({
    userId: 'me',
    id: options.threadID,
    removeLabelIds: ['INBOX'],
  });
});

var markAsUnread = API.simpleAPICall(options => {
  return gapi.client.gmail.users.threads.modify({
    userId: 'me',
    id: options.threadID,
    addLabelIds: ['UNREAD'],
  });
});

var unstar = API.simpleAPICall(options => {
  return gapi.client.gmail.users.threads.modify({
    userId: 'me',
    id: options.threadID,
    removeLabelIds: ['STARRED'],
  });
});

var star = API.simpleAPICall(options => {
  return gapi.client.gmail.users.threads.modify({
    userId: 'me',
    id: options.threadID,
    addLabelIds: ['STARRED'],
  });
});

module.exports = {
  archive,
  list,
  markAsRead,
  markAsUnread,
  star,
  unstar,
};
