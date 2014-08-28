/** @jsx React.DOM */

var counter = 0;

function getClientID() {
  counter += 1;
  return 'ClientID-' + counter;
}

window.getClientID = getClientID;

module.exports.get = getClientID;
