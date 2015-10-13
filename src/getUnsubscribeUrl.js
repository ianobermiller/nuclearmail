/** @flow */

const _ = require('lodash');

function getUnsubscribeUrl(message: ?Object): ?string {
  if (!message) {
    return null;
  }

  const body = message.body['text/html'] || message.body['text/plain'];
  const bodyLower = body.toLowerCase();

  let match = bodyLower.match(/unsubscribe/) || bodyLower.match(/preferences/);
  if (!match) {
    return null;
  }
  const unsubscrieIndices = [
    match.index,
    match.index + 11
  ];

  const urlRegex = /href=['"]([^'"]+)['"]/g;
  const urls = [];
  while ((match = urlRegex.exec(bodyLower))) {
    const url = match[1];
    const urlIndices = [
      match.index,
      bodyLower.indexOf('</a>', match.index),
      bodyLower.lastIndexOf('<a ', match.index)
    ];

    const score = _.min(_.flatten(
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

  const closestUrl = _.min(urls, u => u.score);

  if (closestUrl.score > 100) {
    return null;
  }

  return closestUrl.url;
}

module.exports = getUnsubscribeUrl;
