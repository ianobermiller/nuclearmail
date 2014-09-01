/** @jsx React.DOM */
/* global gapi */

var ActionType = require('./ActionType.js');
var Cache = require('./Cache.js');
var ClientID = require('./ClientID.js');
var Dispatcher = require('./Dispatcher.js');
var EventEmitter = require('events').EventEmitter;
var RSVP = require('rsvp');
var _ = require('lodash');
var utf8 = require('utf8');

var emitter = new EventEmitter();
var messageCache = new Cache('messages');
var isAvailable = false;
var pendingRequests = [];

window.handleGoogleClientLoad = function() {
  var config = {
    client_id: '108971935462-ied7vg89qivj0bsso4imp6imhvpuso5u.apps.googleusercontent.com',
    scope: 'email https://mail.google.com',
    immediate: true
  };
  gapi.auth.authorize(config, whenAuthenticated);
};

function whenAuthenticated() {
  gapi.client.load('gmail', 'v1', whenLoaded);
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

function translateMessage(rawMessage) {
  var msg = rawMessage.payload;
  return {
    body: decodeBody(rawMessage),
    date: new Date(pluckHeader(msg.headers, 'Date')),
    from: parseFrom(pluckHeader(msg.headers, 'From')),
    hasAttachment: !!msg.body.data,
    id: rawMessage.id,
    isDraft: hasLabel(rawMessage, 'DRAFT'),
    isInInbox: hasLabel(rawMessage, 'INBOX'),
    isUnread: hasLabel(rawMessage, 'UNREAD'),
    labelIDs: rawMessage.labelIds,
    raw: rawMessage,
    snippet: _.unescape(rawMessage.snippet),
    subject: pluckHeader(msg.headers, 'Subject'),
  };
}

function hasLabel(rawMessage, label) {
  return rawMessage.labelIds && rawMessage.labelIds.indexOf(label) >= 0;
}

function parseFrom(from) {
  var i = from.indexOf('<');
  return {
    // remove surrounding quotes from name
    name: from.substring(0, i).trim().replace(/(^")|("$)/g, ''),
    email: from.substring(i + 1, from.length - 1)
  };
}

function decodeBody(rawMessage) {
  var parts = (rawMessage.payload.parts || []).concat(rawMessage.payload);
  var result = {};

  collectParts(parts, result);

  return result;
}

function collectParts(parts, result) {
  if (!parts) {
    return;
  }

  parts.forEach(part => {
    if (part.body.data) {
      var contentTypeHeader = pluckHeader(part.headers, 'Content-Type');
      var contentType = contentTypeHeader ?
        contentTypeHeader.split(';')[0] :
        'text/html';
      result[contentType] =
        utf8.decode(decodeUrlSafeBase64(part.body.data));
    }

    if (part.parts) {
      collectParts(part.parts, result);
    }
  });
}

function decodeUrlSafeBase64(s) {
  return atob(s.replace(/\-/g, '+').replace(/\_/g, '/'));
}

function pluckHeader(headers, name) {
  var header = headers && headers.filter(h => h.name === name)[0];
  return header ? header.value : null;
}

var listThreads = wrapAPICallWithEmitter(function(options) {
  return new RSVP.Promise((resolve, reject) => {
    whenGoogleApiAvailable(() => {
      var request = gapi.client.gmail.users.threads.list({
        userID: 'me',
        maxResults: options.maxResults,
        q: options.query || null,
        pageToken: options.pageToken || null,
      });

      request.execute(response => {
        if (!handleError(response, reject)) {
          return;
        }

        var threadIDs = response.threads.map(m => m.id);
        var batch;

        threadIDs.forEach(id => {
          batch = batch || gapi.client.newHttpBatch();
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
          if (!handleError(response, reject)) {
            return;
          }

          var allMessages = [];
          var threads = threadIDs.map(threadID => {
            var thread = itemsResponse[threadID].result;
            var messages = thread.messages.map(translateMessage);
            allMessages.push.apply(allMessages, messages);
            return {
              messageIDs: _.pluck(messages, 'id'),
            }
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

var listMessages = wrapAPICallWithEmitter(function(options) {
  return new RSVP.Promise((resolve, reject) => {
    whenGoogleApiAvailable(() => {
      var request = gapi.client.gmail.users.messages.list({
        userID: 'me',
        maxResults: options.maxResults,
        q: options.query || null,
        pageToken: options.pageToken || null,
      });

      request.execute(response => {
        if (!handleError(response, reject)) {
          return;
        }

        var messageIDs = response.messages.map(m => m.id);
        var cachedMessagesByID = {};
        var batch;

        messageIDs.forEach(id => {
          var cachedMessage = messageCache.get(id);
          if (cachedMessage) {
            cachedMessagesByID[id] = cachedMessage;
            return;
          }

          batch = batch || gapi.client.newHttpBatch();
          batch.add(
            gapi.client.request({
              path: 'gmail/v1/users/me/messages/' + id
            }),
            {id: id}
            // TODO: file a task, this is broken :(
            // dump(gapi.client.gmail.users.messages.get({id: message.id}))
          );
        });

        if (!batch) {
          resolve({
            nextPageToken: response.nextPageToken,
            resultSizeEstimate: response.resultSizeEstimate,
            items: _.map(cachedMessagesByID, translateMessage),
          });
          return;
        }

        batch.execute(itemsResponse => {
          if (!handleError(response, reject)) {
            return;
          }

          resolve({
            nextPageToken: response.nextPageToken,
            resultSizeEstimate: response.resultSizeEstimate,
            items: messageIDs.map(id => {
              var msg = itemsResponse[id] ?
                itemsResponse[id].result :
                messageCache.get(id);
              messageCache.set(msg.id, msg);
              return translateMessage(msg);
            }),
          });
        });
      });
    });
  });
});

var listLabels = wrapAPICallWithEmitter(function() {
  return new RSVP.Promise((resolve, reject) => {
    whenGoogleApiAvailable(() => {
      var request = gapi.client.gmail.users.labels.list({
        userID: 'me',
      });

      request.execute(response => {
        handleError(response, reject);
        resolve(response.labels);
      });
    });
  });
});

var inProgressAPICalls = {};
function wrapAPICallWithEmitter(apiCall) {
  return function(options) {
    var id = ClientID.get();
    inProgressAPICalls[id] = true;
    emitter.emit('start', id);

    return apiCall(options).finally(() => {
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
    reject();
    return false;
  }
  return true;
}

Object.assign(module.exports, {
  listMessages,
  isInProgress,
  listLabels,
  listThreads,
  subscribe,
});
