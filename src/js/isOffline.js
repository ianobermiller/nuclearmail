/** @flow */

function isOffline() {
  return location.search.contains('offline=1');
}

module.exports = isOffline;
