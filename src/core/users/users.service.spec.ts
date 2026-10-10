import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';

const mockUser = {
  id: 'uuid-1234',
  name: 'Raju Kumar',
  email: 'raju@example.com',
  phoneNumber: '+919876543210',
  isActive: true,
  isDeleted: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UsersService', () => {
  let service: UsersService;
  let repository: UsersRepository;

  const mockUsersRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findByIdWithPassword: jest.fn(),
    update: jest.fn(),
    updatePassword: jest.fn(),
    toggleStatus: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UsersRepository>(UsersRepository);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue(null);
      mockUsersRepository.create.mockResolvedValue(mockUser);

      const result = await service.create({
        name: 'Raju Kumar',
        email: 'raju@example.com',
        password: 'password123',
        phoneNumber: '+919876543210',
      });

      expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith('raju@example.com');
      expect(mockUsersRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Raju Kumar',
          email: 'raju@example.com',
          passwordHash: expect.any(String),
          phoneNumber: '+919876543210',
        }),
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.create({
          name: 'Raju Kumar',
          email: 'raju@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);

      expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith('raju@example.com');
      expect(mockUsersRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated users and total', async () => {
      mockUsersRepository.findAll.mockResolvedValue({ users: [mockUser], total: 1 });

      const result = await service.findAll(1, 10);
      expect(result).toEqual({ users: [mockUser], total: 1 });
      expect(mockUsersRepository.findAll).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('findById', () => {
    it('should return a user if found', async () => {
      mockUsersRepository.findById.mockResolvedValue(mockUser);

      const result = await service.findById('uuid-1234');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUsersRepository.findById.mockResolvedValue(null);

      await expect(service.findById('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully when current password matches', async () => {
      const hashedCurrent = await bcrypt.hash('oldPassword123', 10);
      mockUsersRepository.findByIdWithPassword.mockResolvedValue({
        ...mockUser,
        passwordHash: hashedCurrent,
      });
      mockUsersRepository.updatePassword.mockResolvedValue({ ...mockUser });

      const result = await service.changePassword('uuid-1234', {
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword123',
      });

      expect(result).toEqual({ message: 'Password changed successfully' });
      expect(mockUsersRepository.updatePassword).toHaveBeenCalledWith('uuid-1234', expect.any(String));
    });

    it('should throw BadRequestException when current password does not match', async () => {
      const hashedCurrent = await bcrypt.hash('correctPassword123', 10);
      mockUsersRepository.findByIdWithPassword.mockResolvedValue({
        ...mockUser,
        passwordHash: hashedCurrent,
      });

      await expect(
        service.changePassword('uuid-1234', {
          currentPassword: 'wrongPassword123',
          newPassword: 'newPassword123',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('toggleStatus', () => {
    it('should update isActive status', async () => {
      mockUsersRepository.findById.mockResolvedValue(mockUser);
      const updatedUser = { ...mockUser, isActive: false };
      mockUsersRepository.toggleStatus.mockResolvedValue(updatedUser);

      const result = await service.toggleStatus('uuid-1234', false);
      expect(mockUsersRepository.toggleStatus).toHaveBeenCalledWith('uuid-1234', false);
      expect(result.isActive).toBe(false);
    });
  });

  describe('softDelete', () => {
    it('should soft delete user and mark isDeleted=true', async () => {
      mockUsersRepository.findById.mockResolvedValue(mockUser);
      const deletedUser = { ...mockUser, isDeleted: true, isActive: false };
      mockUsersRepository.softDelete.mockResolvedValue(deletedUser);

      const result = await service.softDelete('uuid-1234');
      expect(mockUsersRepository.softDelete).toHaveBeenCalledWith('uuid-1234');
      expect(result.isDeleted).toBe(true);
    });
  });
});
