import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CheckPermissionGuard } from './permissions.guard';

describe('CheckPermissionGuard', () => {
  let guard: CheckPermissionGuard;
  let reflector: Reflector;
  let mockPrisma: any;

  const createMockContext = (user?: any) => {
    const request = { user };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    reflector = new Reflector();
    mockPrisma = {
      role: {
        findFirst: jest.fn(),
      },
    };
    guard = new CheckPermissionGuard(reflector, mockPrisma);
  });

  it('should allow access if no permissions are required', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
    const context = createMockContext();

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should throw ForbiddenException if user is missing on request', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['user:create']);
    const context = createMockContext(null);

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('should allow access if user has required permissions in context', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['user:create']);
    const context = createMockContext({
      id: 'user-1',
      permissions: ['user:create', 'user:read'],
    });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should load permissions from DB if roleId exists and user.permissions is empty', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['user:create']);
    mockPrisma.role.findFirst.mockResolvedValue({
      rolePermissions: [{ permission: { code: 'user:create' } }],
    });

    const context = createMockContext({
      id: 'user-1',
      roleId: 'role-1',
      permissions: [],
    });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should throw ForbiddenException if user lacks required permission', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['user:delete']);
    const context = createMockContext({
      id: 'user-1',
      permissions: ['user:read'],
    });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });
});
