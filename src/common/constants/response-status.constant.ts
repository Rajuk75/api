export const ResponseStatus = {
  STATUS_SUCCESS_OK: 200,
  STATUS_SUCCESS_CREATED: 201,
  NOT_AUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  BAD_REQUEST: 400,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export type ResponseStatusCode = (typeof ResponseStatus)[keyof typeof ResponseStatus];

export default ResponseStatus;
