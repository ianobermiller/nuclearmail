/** @flow */

const router = require('./router');

function select(message: ?Object) {
  if (message) {
    router.transitionTo(
      'thread',
      {messageID: message.id, threadID: message.threadID}
    );
  } else {
    router.transitionTo('app');
  }
}

module.exports = {
  select,
};
