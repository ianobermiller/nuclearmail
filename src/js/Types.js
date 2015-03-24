/* @flow */

'use strict';

var NameAndEmailHax = ((null: any): {
  name: string;
  email: string;
});
type NameAndEmail = typeof NameAndEmailHax;

var MessageHax = ((null: any): {
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
});
type Message = typeof MessageHax;

var ThreadHax = ((null: any): {
  id: string;
  messageIDs: Array<string>;
});
type Thread = typeof ThreadHax;

module.exports = {
  TMessage: MessageHax,
  TThread: ThreadHax,
};
