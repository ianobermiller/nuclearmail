/** @flow */
/* global gapi */

var ActionType = require('./ActionType.js');
var API = require('./API.js');
var Dispatcher = require('./Dispatcher.js');
var MessageTranslator = require('./MessageTranslator');
var RSVP = require('rsvp');
var _ = require('lodash');

function getByID(
  options: {id: string}
): Promise<Object> {
  return API.wrap(() => {
    return API.execute(
      gapi.client.gmail.users.threads.get({userId: 'me', id: options.id})
    ).then(response => _getThreads([response.result])[0]);
  });
}

declare class ListResult {
  nextPageToken: ?string;
  resultSizeEstimate: number;
  items: Array<Object>;
}

function list(
  options: {maxResults: number; query: ?string; pageToken: ?string}
): Promise<ListResult> {
  return API.wrap(() => {
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
        var results = threadIDs.map(threadID => batchResponse[threadID].result);
        var threads = _getThreads(results);

        return {
          nextPageToken: listResponse.nextPageToken,
          resultSizeEstimate: listResponse.resultSizeEstimate,
          items: threads,
        };
      });
    });
  });
}

function _getThreads(results) {
  var allMessages = [];
  var threads = results.map(thread => {
    var messages = thread.messages.map(MessageTranslator.translate);
    allMessages.push.apply(allMessages, messages);
    return {
      id: thread.id,
      messageIDs: _.pluck(messages, 'id'),
    };
  });

  Dispatcher.dispatch({
    type: ActionType.Message.ADD_MANY,
    messages: allMessages,
  });

  return threads;
}

function markAsRead(options: {threadID: String}) {
  return API.wrap(() =>
    API.execute(gapi.client.gmail.users.threads.modify({
      userId: 'me',
      id: options.threadID,
      removeLabelIds: ['UNREAD'],
    }))
  );
}

function archive(options: {threadID: String}) {
  return API.wrap(() =>
    API.execute(gapi.client.gmail.users.threads.modify({
      userId: 'me',
      id: options.threadID,
      removeLabelIds: ['INBOX'],
    }))
  );
}

function moveToInbox(options: {threadID: String}) {
  return API.wrap(() =>
    API.execute(gapi.client.gmail.users.threads.modify({
      userId: 'me',
      id: options.threadID,
      addLabelIds: ['INBOX'],
    }))
  );
}

function markAsUnread(options: {threadID: String}) {
  return API.wrap(() =>
    API.execute(gapi.client.gmail.users.threads.modify({
      userId: 'me',
      id: options.threadID,
      addLabelIds: ['UNREAD'],
    }))
  );
}

function unstar(options: {threadID: String}) {
  return API.wrap(() =>
    API.execute(gapi.client.gmail.users.threads.modify({
      userId: 'me',
      id: options.threadID,
      removeLabelIds: ['STARRED'],
    }))
  );
}

function star(options: {threadID: String}) {
  return API.wrap(() =>
    API.execute(gapi.client.gmail.users.threads.modify({
      userId: 'me',
      id: options.threadID,
      addLabelIds: ['STARRED'],
    }))
  );
}

module.exports = {
  archive,
  getByID,
  list,
  markAsRead,
  markAsUnread,
  moveToInbox,
  star,
  unstar,
};
