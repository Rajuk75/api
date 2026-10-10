import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { UsersRepository } from '../users/users.repository';

const mockUser = {
  id: 'uuid-1234',
  name: 'Raju Kumar',
  email: 'raju@example.com',
  phoneNumber: '+919876543210',
  passwordHash: '$2a$10$hashedpassword',
  isActive: true,
  isDeleted: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AuthService', () => {
  let service: AuthService;
  let authRepository: AuthRepository;
  let usersRepository: UsersRepository;

  const mockAuthRepository = {
    createSession: jest.fn(),
    findSessionByTokenHash: jest.fn(),
    revokeSession: jest.fn(),
    revokeAllUserSessions: jest.fn(),
    createPasswordResetToken: jest.fn(),
    findPasswordResetToken: jest.fn(),
    markPasswordResetTokenUsed: jest.fn(),
  };

  const mockUsersRepository = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findByEmailWithPassword: jest.fn(),
    updatePassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AuthRepository, useValue: mockAuthRepository },
        { provide: UsersRepository, useValue: mockUsersRepository },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    authRepository = module.get<AuthRepository>(AuthRepository);
    usersRepository = module.get<UsersRepository>(UsersRepository);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should login user and return tokens on correct credentials', async () => {
      const hashed = await bcrypt.hash('password123', 10);
      mockUsersRepository.findByEmailWithPassword.mockResolvedValue({
        ...mockUser,
        passwordHash: hashed,
      });
      mockAuthRepository.createSession.mockResolvedValue({});

      const result = await service.login({
        email: 'raju@example.com',
        password: 'password123',
      });

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.expiresIn).toBeDefined();
      expect(result.user.email).toBe('raju@example.com');
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      const hashed = await bcrypt.hash('correctPassword', 10);
      mockUsersRepository.findByEmailWithPassword.mockResolvedValue({
        ...mockUser,
        passwordHash: hashed,
      });

      await expect(
        service.login({
          email: 'raju@example.com',
          password: 'wrongPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user is deactivated', async () => {
      mockUsersRepository.findByEmailWithPassword.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      await expect(
        service.login({
          email: 'raju@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    it('should rotate token and return new pair', async () => {
      mockAuthRepository.findSessionByTokenHash.mockResolvedValue({
        id: 'session-123',
        expiresAt: new Date(Date.now() + 100000),
        user: mockUser,
      });
      mockAuthRepository.revokeSession.mockResolvedValue({});
      mockAuthRepository.createSession.mockResolvedValue({});

      const result = await service.refreshToken({ refreshToken: 'raw-refresh-token' });
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.expiresIn).toBeDefined();
      expect(mockAuthRepository.revokeSession).toHaveBeenCalledWith('session-123');
    });

    it('should throw UnauthorizedException on invalid session', async () => {
      mockAuthRepository.findSessionByTokenHash.mockResolvedValue(null);

      await expect(service.refreshToken({ refreshToken: 'invalid-token' })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('resetPassword', () => {
    it('should reset password on valid token', async () => {
      mockAuthRepository.findPasswordResetToken.mockResolvedValue({
        id: 'reset-1',
        userId: 'uuid-1234',
      });
      mockUsersRepository.updatePassword.mockResolvedValue({});
      mockAuthRepository.markPasswordResetTokenUsed.mockResolvedValue({});
      mockAuthRepository.revokeAllUserSessions.mockResolvedValue({});

      const result = await service.resetPassword({
        token: 'valid-reset-token',
        newPassword: 'newSecretPassword123',
      });

      expect(result.message).toBe('Password has been reset successfully');
      expect(mockUsersRepository.updatePassword).toHaveBeenCalled();
      expect(mockAuthRepository.revokeAllUserSessions).toHaveBeenCalledWith('uuid-1234');
    });

    it('should throw BadRequestException on invalid token', async () => {
      mockAuthRepository.findPasswordResetToken.mockResolvedValue(null);

      await expect(
        service.resetPassword({
          token: 'invalid-token',
          newPassword: 'newSecretPassword123',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
