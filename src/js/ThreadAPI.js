/** @jsx React.DOM */
/* global gapi */

var ActionType = require('./ActionType.js');
var API = require('./API.js');
var Dispatcher = require('./Dispatcher.js');
var MessageTranslator = require('./MessageTranslator');
var RSVP = require('rsvp');
var _ = require('lodash');

var list = API.wrap((options) => {
  return API.execute(gapi.client.gmail.users.threads.list({
    userId: 'me',
    maxResults: options.maxResults,
    q: options.query || null,
    pageToken: options.pageToken || null,
  })).then(listResponse => {
    var threadIDs = (listResponse.threads || []).map(m => m.id);

    if (!threadIDs.length) {
      return Promise.resolve({
        nextPageToken: null,
        resultSizeEstimate: 0,
        items: [],
      });
    }

    var batch = gapi.client.newHttpBatch();
    threadIDs.forEach(id => {
      batch.add(
        gapi.client.gmail.users.threads.get({userId: 'me', id}),
        {id}
      );
    });

    return API.execute(batch).then(batchResponse => {
      var allMessages = [];
      var threads = threadIDs.map(threadID => {
        var thread = batchResponse[threadID].result;
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

      return {
        nextPageToken: listResponse.nextPageToken,
        resultSizeEstimate: listResponse.resultSizeEstimate,
        items: threads,
      };
    });
  });
});

var markAsRead = API.wrap((options) => {
  return API.execute(gapi.client.gmail.users.threads.modify({
    userId: 'me',
    id: options.threadID,
    removeLabelIds: ['UNREAD'],
  }));
});

var archive = API.wrap((options) => {
  return API.execute(gapi.client.gmail.users.threads.modify({
    userId: 'me',
    id: options.threadID,
    removeLabelIds: ['INBOX'],
  }));
});

var markAsUnread = API.wrap((options) => {
  return API.execute(gapi.client.gmail.users.threads.modify({
    userId: 'me',
    id: options.threadID,
    addLabelIds: ['UNREAD'],
  }));
});

var unstar = API.wrap((options) => {
  return API.execute(gapi.client.gmail.users.threads.modify({
    userId: 'me',
    id: options.threadID,
    removeLabelIds: ['STARRED'],
  }));
});

var star = API.wrap((options) => {
  return API.execute(gapi.client.gmail.users.threads.modify({
    userId: 'me',
    id: options.threadID,
    addLabelIds: ['STARRED'],
  }));
});

module.exports = {
  archive,
  list,
  markAsRead,
  markAsUnread,
  star,
  unstar,
};
