import { Response, Request } from 'express';
import { ResponseStatus } from '../constants/response-status.constant';

function formatErrorPayload(data: any) {
  if (!data) return { message: 'An error occurred' };
  if (typeof data === 'string') return { message: data };
  if (data instanceof Error) return { message: data.message };
  if (typeof data === 'object') return data;
  return { message: String(data) };
}

export function setSuccess<T = any>(res: Response, data?: T): Response {
  return res.status(ResponseStatus.STATUS_SUCCESS_OK).json({ success: true, ...data });
}

export function setCreateSuccess<T = any>(res: Response, data?: T): Response {
  return res.status(ResponseStatus.STATUS_SUCCESS_CREATED).json({ success: true, ...data });
}

export function setNotAuthorized(res: Response, data?: any): Response {
  return res.status(ResponseStatus.NOT_AUTHORIZED).json({ success: false, ...formatErrorPayload(data) });
}

export function setNotFoundError(res: Response, data?: any): Response {
  return res.status(ResponseStatus.NOT_FOUND).json({ success: false, ...formatErrorPayload(data) });
}

export function setForbidden(res: Response, data?: any): Response {
  return res.status(ResponseStatus.FORBIDDEN).json({ success: false, ...formatErrorPayload(data) });
}

export function setBadRequest(res: Response, data?: any): Response {
  return res.status(ResponseStatus.BAD_REQUEST).json({ success: false, ...formatErrorPayload(data) });
}

export function setConflictError(res: Response, data?: any): Response {
  return res.status(ResponseStatus.CONFLICT).json({ success: false, ...formatErrorPayload(data) });
}

export function setServerError(res: Response, data?: any): Response {
  return res.status(ResponseStatus.INTERNAL_SERVER_ERROR).json({ success: false, ...formatErrorPayload(data) });
}

export function createResponseSetter(moduleName: string) {
  return function setResponse(req: Request, res: Response, err: any, model: Record<string, any>): Response | void {
    if (err) {
      return setServerError(res, `Error occurred: ${err}`);
    } else {
      const moduleData = model ? model[moduleName] : null;
      if (moduleData) {
        return setSuccess(res, { [moduleName]: moduleData });
      } else {
        return setNotFoundError(res, `${moduleName}: ${req.params?.id} not found`);
      }
    }
  };
}

export default {
  setSuccess,
  setCreateSuccess,
  setNotAuthorized,
  setNotFoundError,
  setForbidden,
  setBadRequest,
  setConflictError,
  setServerError,
  createResponseSetter,
};
