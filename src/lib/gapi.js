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

declare class GmailClient {
  users: {
    labels: {
      list: (options: Object) => GoogleAPIExecutable;
    };
    threads: {
      list: (options: Object) => GoogleAPIExecutable;
      modify: (options: Object) => GoogleAPIExecutable;
      get: (options: Object) => GoogleAPIExecutable;
    };
    messages: {
      list: (options: Object) => GoogleAPIExecutable;
      modify: (options: Object) => GoogleAPIExecutable;
      get: (options: Object) => GoogleAPIExecutable;
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
