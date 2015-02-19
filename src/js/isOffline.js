/** @flow */

function isOffline(): bool {
  return !!localStorage.getItem('isOffline');
}

module.exports = isOffline;
