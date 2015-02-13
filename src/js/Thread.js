/* @flow */

type Thread = {
  id: string;
  messageIDs: Array<string>;
};

var fake: any = true;
module.exports = fake || Thread;
