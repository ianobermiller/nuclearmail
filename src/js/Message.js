/* @flow */

type NameAndEmail = {
  name: string;
  email: string;
};

type Message = {
  body: {[mimeType: string]: string};
  date: Date;
  from: NameAndEmail;
  to: NameAndEmail;
  hasAttachment: bool;
  id: string;
  isDraft: bool;
  isInInbox: bool;
  isUnread: bool;
  isStarred: bool;
  labelIDs: Array<string>;
  raw: Object;
  snippet: string;
  subject: ?string;
  threadID: string;
};

var fake: any = true;
module.exports = fake || Message;
