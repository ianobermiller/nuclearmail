declare class GoogleAPIStatic {
  auth: GoogleAPIAuth;
  client: GoogleAPIClient;
}

declare class GoogleAPIAuth {
  authorize(
    config: GoogleAPIAuthorizeConfig,
    callback: (result: GoogleAPIResponse) => void
  ): void;
}

declare class GoogleAPIClient {
  load(
    name: string,
    version: string,
    callback: () => void
  ): void;

  gmail: GmailClient;

  newHttpBatch: () => GoogleAPIBatch;
}

type GmailGetOptions = {
  userId: string;
  id: string;
};

type GmailThreadModifyOptions = {
  userId: string;
  id: string;
  addLabelIds?: Array<string>;
  removeLabelIds?: Array<string>;
};

type GmailListOptions = {
  userId: string;
  maxResults?: number;
  q?: ?string;
  pageToken?: ?string;
};

declare class GmailClient {
  users: {
    labels: {
      list: (options: GmailListOptions) => GoogleAPIExecutable;
    };
    threads: {
      list: (options: GmailListOptions) => GoogleAPIExecutable;
      modify: (options: GmailThreadModifyOptions) => GoogleAPIExecutable;
      get: (options: GmailGetOptions) => GoogleAPIExecutable;
    };
    messages: {
      list: (options: GmailListOptions) => GoogleAPIExecutable;
      modify: (options: GmailGetOptions) => GoogleAPIExecutable;
      get: (options: GmailGetOptions) => GoogleAPIExecutable;
    };
  };
}

declare class GoogleAPIBatch extends GoogleAPIExecutable {
  add: (executable: GoogleAPIExecutable) => void;
}

declare class GoogleAPIExecutable {
  execute: (callback: (response: GoogleAPIResponse) => void) => void;
}

declare class GoogleAPIResponse {
  error: Object;
}

declare class GoogleAPIAuthorizeConfig {
  client_id: string;
  scope: string;
  immediate: boolean;
}

declare var gapi: GoogleAPIStatic;
