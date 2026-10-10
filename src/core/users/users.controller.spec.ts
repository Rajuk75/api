import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

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

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    changePassword: jest.fn(),
    toggleStatus: jest.fn(),
    softDelete: jest.fn(),
  };

  const createMockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    it('should create user and return 201 with success envelope', async () => {
      mockUsersService.create.mockResolvedValue(mockUser);
      const res = createMockResponse();

      await controller.createUser(
        {
          name: 'Raju Kumar',
          email: 'raju@example.com',
          password: 'password123',
          phoneNumber: '+919876543210',
        },
        res,
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'User created successfully',
        data: mockUser,
      });
    });
  });

  describe('getAllUsers', () => {
    it('should return list of users with total and 200', async () => {
      mockUsersService.findAll.mockResolvedValue({ users: [mockUser], total: 1 });
      const res = createMockResponse();

      await controller.getAllUsers('1', '10', res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Users retrieved successfully',
        data: [mockUser],
        total: 1,
      });
    });
  });

  describe('getUserById', () => {
    it('should return single user with 200', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);
      const res = createMockResponse();

      await controller.getUserById('uuid-1234', res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'User retrieved successfully',
        data: mockUser,
      });
    });
  });

  describe('changePassword', () => {
    it('should change password and return 200', async () => {
      mockUsersService.changePassword.mockResolvedValue({ message: 'Password changed successfully' });
      const res = createMockResponse();

      await controller.changePassword(
        'uuid-1234',
        {
          currentPassword: 'oldPassword123',
          newPassword: 'newPassword123',
        },
        res,
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Password changed successfully',
      });
    });
  });

  describe('toggleStatus', () => {
    it('should update isActive status and return 200', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      mockUsersService.toggleStatus.mockResolvedValue(inactiveUser);
      const res = createMockResponse();

      await controller.toggleStatus('uuid-1234', false, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'User status updated to inactive successfully',
        data: inactiveUser,
      });
    });
  });

  describe('deleteUser', () => {
    it('should soft-delete user and return 200', async () => {
      const deletedUser = { ...mockUser, isDeleted: true, isActive: false };
      mockUsersService.softDelete.mockResolvedValue(deletedUser);
      const res = createMockResponse();

      await controller.deleteUser('uuid-1234', res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'User soft-deleted successfully',
        data: deletedUser,
      });
    });
  });
});
