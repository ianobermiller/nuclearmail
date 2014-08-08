/** @jsx React.DOM */
/* global gapi */

var Cache = require('./Cache.js');
var _ = require('lodash');

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
    from: parseFrom(pluckHeader(msg.headers, 'From')),
    id: rawMessage.id,
    raw: rawMessage,
    snippet: rawMessage.snippet,
    subject: pluckHeader(msg.headers, 'Subject'),
    hasAttachment: !!msg.body.data,
  };
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
        decodeUrlSafeBase64(part.body.data);
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

module.exports.getMessages = function(options) {

    if (!options.maxResults) {
      debugger;
    }

  return new Promise((resolve, reject) => {
    whenGoogleApiAvailable(() => {
      var request = gapi.client.gmail.users.messages.list({
        userID: 'me',
        maxResults: options.maxResults,
        q: options.query || null,
        pageToken: options.pageToken || null,
      });

      request.execute(response => {
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
};
