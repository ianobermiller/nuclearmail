/** @flow */

const _ = require('lodash');
const utf8 = require('utf8');

import type {TMessage} from './Types';
type Message = typeof TMessage;

function translateMessage(rawMessage: Object): Message {
  const msg = rawMessage.payload;
  return {
    body: decodeBody(rawMessage),
    date: new Date(pluckHeader(msg.headers, 'Date')),
    from: parseNameAndEmail(pluckHeader(msg.headers, 'From') || ''),
    to: parseNameAndEmail(pluckHeader(msg.headers, 'To') || ''),
    hasAttachment: !!msg.body.data,
    id: rawMessage.id,
    isDraft: hasLabel(rawMessage, 'DRAFT'),
    isInInbox: hasLabel(rawMessage, 'INBOX'),
    isUnread: hasLabel(rawMessage, 'UNREAD'),
    isStarred: hasLabel(rawMessage, 'STARRED'),
    labelIDs: _.difference(
      rawMessage.labelIds,
      ['DRAFT', 'INBOX', 'UNREAD', 'STARRED']
    ),
    raw: rawMessage,
    snippet: _.unescape(rawMessage.snippet),
    subject: pluckHeader(msg.headers, 'Subject'),
    threadID: rawMessage.threadId,
  };
}

function hasLabel(rawMessage: Object, label: string): boolean {
  return rawMessage.labelIds && rawMessage.labelIds.indexOf(label) >= 0;
}

function parseNameAndEmail(input: string): {name: string; email: string;} {
  const i = input.indexOf('<');
  return {
    // remove surrounding quotes from name
    name: input.substring(0, i).trim().replace(/(^")|("$)/g, ''),
    email: i >= 0 ? input.substring(i + 1, input.length - 1) : input,
  };
}

function decodeBody(rawMessage: Object) {
  const parts = (rawMessage.payload.parts || []).concat(rawMessage.payload);
  const result = {};

  collectParts(parts, result);

  return result;
}

function collectParts(parts, result) {
  if (!parts) {
    return;
  }

  parts.forEach(part => {
    if (part.body.data) {
      const contentTypeHeader = pluckHeader(part.headers, 'Content-Type');
      const contentType = contentTypeHeader ?
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

function pluckHeader(
  headers: Array<{name: string; value: string}>, name: string
): ?string {
  const header = headers ? headers.filter(h => h.name === name)[0] : null;
  return header ? header.value : null;
}

module.exports.translate = translateMessage;
