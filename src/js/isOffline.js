/** @flow */

function isOffline() {
  return localStorage.getItem('isOffline');
}

module.exports = isOffline;
