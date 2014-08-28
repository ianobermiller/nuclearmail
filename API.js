/** @jsx React.DOM */
/* global gapi */

var Cache = require('./Cache.js');
var ClientID = require('./ClientID.js');
var EventEmitter = require('events').EventEmitter;
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

function transformMessage(rawMessage) {
  var msg = rawMessage.payload;
  return {
    body: decodeBody(rawMessage),
    date: new Date(pluckHeader(msg.headers, 'Date')),
    from: parseFrom(pluckHeader(msg.headers, 'From')),
    hasAttachment: !!msg.body.data,
    id: rawMessage.id,
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

  parts.forEach(part => {
    if (part.body.data) {
      var contentTypeHeader = pluckHeader(part.headers, 'Content-Type');
      var contentType = contentTypeHeader ?
        contentTypeHeader.split(';')[0] :
        'text/html';
      result[contentType] =
        utf8.decode(decodeUrlSafeBase64(part.body.data));
    }
  });

  return result;
}

function decodeUrlSafeBase64(s) {
  return atob(s.replace(/\-/g, '+').replace(/\_/g, '/'));
}

function pluckHeader(headers, name) {
  var header = headers && headers.filter(h => h.name === name)[0];
  return header ? header.value : null;
}

module.exports.listThreads = wrapAPICallWithEmitter(function(options) {
  return new Promise((resolve, reject) => {
    whenGoogleApiAvailable(() => {
      var request = gapi.client.gmail.users.threads.list({
        userID: 'me',
        maxResults: options.maxResults,
        q: options.query || null,
        pageToken: options.pageToken || null,
      });

      request.execute(response => {
        handleError(response, reject);
        var threadIDs = response.threads.map(m => m.id);
        var cachedMessagesByID = {};
        var batch;

        threadIDs.forEach(id => {
          var cachedMessage = messageCache.get(id);
          if (cachedMessage) {
            cachedMessagesByID[id] = cachedMessage;
            return;
          }

          batch = batch || gapi.client.newHttpBatch();
          batch.add(
            gapi.client.request({
              path: 'gmail/v1/users/me/threads/' + id
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
            items: _.map(cachedMessagesByID, transformMessage),
          });
          return;
        }

        batch.execute(itemsResponse => {
          handleError(itemsResponse, reject);
          resolve({
            nextPageToken: response.nextPageToken,
            resultSizeEstimate: response.resultSizeEstimate,
            items: threadIDs.map(id => {
              var msg = itemsResponse[id] ?
                _.last(itemsResponse[id].result.messages) :
                messageCache.get(id);
              messageCache.set(msg.id, msg);
              return transformMessage(msg);
            }),
          });
        });
      });
    });
  });
});

var getMessages = wrapAPICallWithEmitter(function(options) {
  return new Promise((resolve, reject) => {
    whenGoogleApiAvailable(() => {
      var request = gapi.client.gmail.users.messages.list({
        userID: 'me',
        maxResults: options.maxResults,
        q: options.query || null,
        pageToken: options.pageToken || null,
      });

      request.execute(response => {
        handleError(response, reject);
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
            items: _.map(cachedMessagesByID, transformMessage),
          });
          return;
        }

        batch.execute(itemsResponse => {
          handleError(itemsResponse, reject);
          resolve({
            nextPageToken: response.nextPageToken,
            resultSizeEstimate: response.resultSizeEstimate,
            items: messageIDs.map(id => {
              var msg = itemsResponse[id] ?
                itemsResponse[id].result :
                messageCache.get(id);
              messageCache.set(msg.id, msg);
              return transformMessage(msg);
            }),
          });
        });
      });
    });
  });
});

var listLabels = wrapAPICallWithEmitter(function() {
  return new Promise((resolve, reject) => {
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

    return apiCall(options).then(result => {
      delete inProgressAPICalls[id];
      emitter.emit('stop', id);
      if (!Object.keys(inProgressAPICalls).length) {
        emitter.emit('allStopped');
      }
      return result;
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
  }
}

Object.assign(module.exports, {
  getMessages,
  isInProgress,
  listLabels,
  subscribe,
});
