/** @jsx React.DOM */
/* global gapi */

var Cache = require('./Cache.js');

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
    id: rawMessage.id,
    subject: pluckHeader(msg.headers, 'Subject'),
    from: parseFrom(pluckHeader(msg.headers, 'From')),
    body: decodeBody(rawMessage),
    raw: rawMessage
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
  var header = headers.filter(h => h.name === name)[0];
  return header ? header.value : null;
}

module.exports.getMessages = function(options, callback) {
  whenGoogleApiAvailable(() => {
    var request = gapi.client.gmail.users.messages.list({
      userID: 'me',
      maxResults: 100,
      q: options.query || null
    });

    request.execute(response => {
      var messageIDs = response.messages.map(m => m.id);
      var cachedMessages = [];
      var batch;

      messageIDs.forEach(id => {
        var cachedMessage = messageCache.get(id);
        if (cachedMessage) {
          cachedMessages.push(cachedMessage);
          return;
        }

        batch = batch || gapi.client.newHttpBatch();
        batch.add(
          gapi.client.request({
            'path': 'gmail/v1/users/me/messages/' + id
          })
          // TODO: file a task, this is broken :(
          // dump(gapi.client.gmail.users.messages.get({id: message.id}))
        );
      });

      if (!batch) {
        callback(cachedMessages.map(transformMessage));
        return;
      }

      batch.execute(response => {
        var ids = Object.keys(response);
        callback(ids.map(id => {
          var msg = response[id].result;
          messageCache.set(msg.id, msg);
          return transformMessage(msg);
        }));
      });
    });
  });
};

var res = {
   "messages": [
    {
     "id": "1475c9fc8f5118ff",
     "threadId": "1475c9fc8f5118ff"
    },
    {
     "id": "1475c4dc64815632",
     "threadId": "147269594ceb3b52"
    },
    {
     "id": "1475c4da2d05b012",
     "threadId": "147269594ceb3b52"
    },
    {
     "id": "1475c3dea862440e",
     "threadId": "147269594ceb3b52"
    },
    {
     "id": "1475c3dce39816bb",
     "threadId": "147269594ceb3b52"
    },
    {
     "id": "1475be027d542df7",
     "threadId": "1475be027d542df7"
    },
    {
     "id": "1475b7954aea0b7b",
     "threadId": "1475b7954aea0b7b"
    },
    {
     "id": "1475b7932edff317",
     "threadId": "1475b7932edff317"
    },
    {
     "id": "1475b401417bd6ea",
     "threadId": "1475b401417bd6ea"
    },
    {
     "id": "1475b1a11e04bf25",
     "threadId": "1475b1a11e04bf25"
    }
   ],
   "nextPageToken": "07146117431334128463",
   "resultSizeEstimate": 131
  }
;

function dump(arg) {
  console.log(arg);
  return arg;
}
