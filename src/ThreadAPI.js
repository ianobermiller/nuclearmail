/** @flow */
/* global gapi */

const ActionType = require('./ActionType');
const API = require('./API');
const MessageTranslator = require('./MessageTranslator');
const _ = require('lodash');

function getByID(
  options: {id: string}
): Promise<Object> {
  return API.wrap(() => {
    return API.execute(
      gapi.client.gmail.users.threads.get({userId: 'me', id: options.id})
    ).then(response => {
      const {threads, messages} = processThreadResults([response.result]);
      return {
        messages,
        thread: threads[0],
      };
    });
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
      const threadIDs = (listResponse.threads || []).map(m => m.id);

      if (!threadIDs.length) {
        return Promise.resolve({
          nextPageToken: null,
          resultSizeEstimate: 0,
          threads: [],
          messages: [],
        });
      }

      const batch = gapi.client.newHttpBatch();
      threadIDs.forEach(id => {
        batch.add(
          gapi.client.gmail.users.threads.get({userId: 'me', id}),
          {id}
        );
      });

      return API.execute(batch).then(batchResponse => {
        const results = threadIDs.map(threadID => batchResponse[threadID].result);
        const {threads, messages} = processThreadResults(results);

        return {
          nextPageToken: listResponse.nextPageToken,
          resultSizeEstimate: listResponse.resultSizeEstimate,
          threads,
          messages,
        };
      });
    });
  });
}

function processThreadResults(results) {
  const allMessages = [];
  const threads = results.filter(thread => thread).map(thread => {
    const messages = thread.messages.map(MessageTranslator.translate);
    allMessages.push.apply(allMessages, messages);
    return {
      id: thread.id,
      messageIDs: _.pluck(messages, 'id'),
    };
  });

  return {threads, messages: allMessages};
}

function markAsRead(options: {threadID: string}) {
  return API.wrap(() =>
    API.execute(gapi.client.gmail.users.threads.modify({
      userId: 'me',
      id: options.threadID,
      removeLabelIds: ['UNREAD'],
    }))
  );
}

function archive(options: {threadID: string}) {
  return API.wrap(() =>
    API.execute(gapi.client.gmail.users.threads.modify({
      userId: 'me',
      id: options.threadID,
      removeLabelIds: ['INBOX'],
    }))
  );
}

function moveToInbox(options: {threadID: string}) {
  return API.wrap(() =>
    API.execute(gapi.client.gmail.users.threads.modify({
      userId: 'me',
      id: options.threadID,
      addLabelIds: ['INBOX'],
    }))
  );
}

function markAsUnread(options: {threadID: string}) {
  return API.wrap(() =>
    API.execute(gapi.client.gmail.users.threads.modify({
      userId: 'me',
      id: options.threadID,
      addLabelIds: ['UNREAD'],
    }))
  );
}

function unstar(options: {threadID: string}) {
  return API.wrap(() =>
    API.execute(gapi.client.gmail.users.threads.modify({
      userId: 'me',
      id: options.threadID,
      removeLabelIds: ['STARRED'],
    }))
  );
}

function star(options: {threadID: string}) {
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
