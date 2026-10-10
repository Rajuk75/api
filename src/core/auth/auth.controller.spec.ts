import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthResponse = {
  accessToken: 'jwt-access-token-123',
  refreshToken: 'raw-refresh-token-456',
  user: {
    id: 'uuid-1234',
    name: 'Raju Kumar',
    email: 'raju@example.com',
    phoneNumber: '+919876543210',
    isActive: true,
  },
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  };

  const createMockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockRequest: any = {
    ip: '127.0.0.1',
    socket: { remoteAddress: '127.0.0.1' },
    headers: { 'user-agent': 'JestTest' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should login and return 200 with tokens', async () => {
      mockAuthService.login.mockResolvedValue(mockAuthResponse);
      const res = createMockResponse();

      await controller.login(
        {
          email: 'raju@example.com',
          password: 'password123',
        },
        mockRequest,
        res,
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockAuthResponse,
        }),
      );
    });
  });

  describe('refreshToken', () => {
    it('should refresh token and return 200', async () => {
      mockAuthService.refreshToken.mockResolvedValue(mockAuthResponse);
      const res = createMockResponse();

      await controller.refreshToken({ refreshToken: 'raw-token' }, mockRequest, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockAuthResponse,
        }),
      );
    });
  });

  describe('logout', () => {
    it('should logout and return 200', async () => {
      mockAuthService.logout.mockResolvedValue({ message: 'Logged out successfully' });
      const res = createMockResponse();

      await controller.logout({ refreshToken: 'raw-token' }, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Logged out successfully',
        }),
      );
    });
  });
});
