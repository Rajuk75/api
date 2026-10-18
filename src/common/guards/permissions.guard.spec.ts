import { CheckPermissionGuard } from './permissions.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

describe('CheckPermissionGuard', () => {
  let guard: CheckPermissionGuard;
  let reflector: Reflector;

  const createMockContext = (user: any = null): ExecutionContext => {
    const mockRequest = { user };
    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    reflector = new Reflector();
    guard = new CheckPermissionGuard(reflector);
  });

  it('should allow access if no permissions are required', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
    const context = createMockContext();

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should throw ForbiddenException if user is missing on request', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['campus:create']);
    const context = createMockContext(null);

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('should allow access if user role has required permission', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['campus:create']);
    const context = createMockContext({
      id: 'admin-1',
      role: 'ADMIN',
    });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should throw ForbiddenException if user role lacks required permission', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['campus:create']);
    const context = createMockContext({
      id: 'teacher-1',
      role: 'TEACHER', // Teacher cannot create campus
    });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });
});
