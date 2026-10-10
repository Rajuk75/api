import { AsyncLocalStorage } from 'async_hooks';

export interface RequestUserContext {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string | null;
  isActive: boolean;
  tenantId?: string | null;
  campusId?: string | null;
  roleId?: string | null;
  permissions?: string[];
  [key: string]: any;
}

const asyncLocalStorage = new AsyncLocalStorage<RequestUserContext>();

export function setUserContext(user: RequestUserContext): void {
  asyncLocalStorage.enterWith(user);
}

export function getUserContext(): RequestUserContext | undefined {
  return asyncLocalStorage.getStore();
}

export function runWithUserContext<T>(user: RequestUserContext, fn: () => T): T {
  return asyncLocalStorage.run(user, fn);
}

export default {
  setUserContext,
  getUserContext,
  runWithUserContext,
};
