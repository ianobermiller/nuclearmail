/** @flow */

var counter = 0;

function getClientID(): string {
  counter += 1;
  return 'ClientID-' + counter;
}

module.exports.get = getClientID;
