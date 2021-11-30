export type DeleteError = {
  code: string,
  clientVersion: string,
  meta: {
    cause: string,
  }
};