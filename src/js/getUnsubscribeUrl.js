/** @flow */

var _ = require('lodash');

function getUnsubscribeUrl(message: ?Object): ?string {
  if (!message) {
    return null;
  }

  var body = message.body['text/html'] || message.body['text/plain'];
  var bodyLower = body.toLowerCase();

  var match = bodyLower.match(/unsubscribe/) || bodyLower.match(/preferences/);
  if (!match) {
    return null;
  }
  var unsubscrieIndices = [
    match.index,
    match.index + 11
  ];

  var urlRegex = /href=['"]([^'"]+)['"]/g;
  var urls = [];
  while (match = urlRegex.exec(bodyLower)) {
    var url = match[1];
    var index = bodyLower.indexOf("</a>", match.index);
    var urlIndices = [
      match.index,
      bodyLower.indexOf("</a>", match.index),
      bodyLower.lastIndexOf("<a ", match.index)
    ];

    var score = _.min(_.flatten(
      urlIndices.map(urlIndex =>
        unsubscrieIndices.map(unsubIndex =>
          Math.abs(urlIndex - unsubIndex)
        )
      )
    ));

    urls.push({
      url: body.substring(match.index + 6, match.index + 6 + url.length),
      score
    });
  }

  var closestUrl = _.min(urls, url => url.score);

  if (closestUrl.score > 100) {
    return null;
  }

  return closestUrl.url;
}

module.exports = getUnsubscribeUrl;
