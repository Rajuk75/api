import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { TokenHelper } from '../utils/token.helper';
import { getUserContext } from '../utils/context';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockPrisma: any;

  const mockUser = {
    id: 'uuid-1234',
    name: 'Raju Kumar',
    email: 'raju@example.com',
    phoneNumber: '+919876543210',
    isActive: true,
  };

  const createMockContext = (authHeader?: string) => {
    const request: any = {
      headers: {
        authorization: authHeader,
      },
    };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      request,
    };
  };

  beforeEach(() => {
    mockPrisma = {
      user: {
        findFirst: jest.fn(),
      },
    };
    guard = new AuthGuard(mockPrisma);
    jest.clearAllMocks();
  });

  it('should throw UnauthorizedException if no header is provided', async () => {
    const { switchToHttp } = createMockContext();
    await expect(guard.canActivate({ switchToHttp } as ExecutionContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if authorization format is invalid', async () => {
    const { switchToHttp } = createMockContext('Basic 12345');
    await expect(guard.canActivate({ switchToHttp } as ExecutionContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if token is invalid or expired', async () => {
    const { switchToHttp } = createMockContext('Bearer invalid.jwt.token');
    await expect(guard.canActivate({ switchToHttp } as ExecutionContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if user is not found or inactive in DB', async () => {
    const { accessToken } = TokenHelper.generateAccessToken({
      userId: 'uuid-1234',
      email: 'raju@example.com',
    });
    mockPrisma.user.findFirst.mockResolvedValue(null);

    const { switchToHttp } = createMockContext(`Bearer ${accessToken}`);
    await expect(guard.canActivate({ switchToHttp } as ExecutionContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should succeed, attach user to request, and set ALS context when token and user are valid', async () => {
    const { accessToken } = TokenHelper.generateAccessToken({
      userId: 'uuid-1234',
      email: 'raju@example.com',
    });
    mockPrisma.user.findFirst.mockResolvedValue(mockUser);

    const context = createMockContext(`Bearer ${accessToken}`);
    const result = await guard.canActivate(context as unknown as ExecutionContext);

    expect(result).toBe(true);
    expect(context.request.user).toEqual(mockUser);
    expect(getUserContext()).toEqual(mockUser);
  });
});
