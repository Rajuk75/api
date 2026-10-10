import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenantsRepository } from './tenants.repository';
import { TenantType, TenantStatus } from '@prisma/client';

const mockTenant = {
  id: 'tenant-uuid-1',
  name: 'Delhi Public School',
  type: TenantType.SCHOOL,
  status: TenantStatus.ACTIVE,
  timezone: 'Asia/Kolkata',
  defaultLocale: 'en',
  isActive: true,
  isDeleted: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('TenantsService', () => {
  let service: TenantsService;
  let repository: TenantsRepository;

  const mockTenantsRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    updateStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsService,
        {
          provide: TenantsRepository,
          useValue: mockTenantsRepository,
        },
      ],
    }).compile();

    service = module.get<TenantsService>(TenantsService);
    repository = module.get<TenantsRepository>(TenantsRepository);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a tenant', async () => {
      mockTenantsRepository.create.mockResolvedValue(mockTenant);

      const result = await service.create({
        name: 'Delhi Public School',
        type: TenantType.SCHOOL,
      });

      expect(mockTenantsRepository.create).toHaveBeenCalledWith({
        name: 'Delhi Public School',
        type: TenantType.SCHOOL,
      });
      expect(result).toEqual(mockTenant);
    });
  });

  describe('findAll', () => {
    it('should return list of tenants with count', async () => {
      const mockResult = { tenants: [mockTenant], total: 1 };
      mockTenantsRepository.findAll.mockResolvedValue(mockResult);

      const result = await service.findAll(1, 10, 'dps');

      expect(mockTenantsRepository.findAll).toHaveBeenCalledWith(1, 10, 'dps', undefined, undefined);
      expect(result).toEqual(mockResult);
    });
  });

  describe('findOne', () => {
    it('should return tenant by id', async () => {
      mockTenantsRepository.findById.mockResolvedValue(mockTenant);

      const result = await service.findOne('tenant-uuid-1');
      expect(result).toEqual(mockTenant);
    });

    it('should throw NotFoundException if tenant not found', async () => {
      mockTenantsRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update tenant details', async () => {
      mockTenantsRepository.findById.mockResolvedValue(mockTenant);
      mockTenantsRepository.update.mockResolvedValue({
        ...mockTenant,
        name: 'DPS International',
      });

      const result = await service.update('tenant-uuid-1', { name: 'DPS International' });

      expect(result.name).toBe('DPS International');
    });
  });

  describe('softDelete', () => {
    it('should soft delete tenant', async () => {
      mockTenantsRepository.findById.mockResolvedValue(mockTenant);
      mockTenantsRepository.softDelete.mockResolvedValue({
        ...mockTenant,
        isDeleted: true,
        isActive: false,
      });

      const result = await service.softDelete('tenant-uuid-1');
      expect(result.isDeleted).toBe(true);
    });
  });

  describe('updateStatus', () => {
    it('should update tenant status', async () => {
      mockTenantsRepository.findById.mockResolvedValue(mockTenant);
      mockTenantsRepository.updateStatus.mockResolvedValue({
        ...mockTenant,
        status: TenantStatus.SUSPENDED,
      });

      const result = await service.updateStatus('tenant-uuid-1', TenantStatus.SUSPENDED);
      expect(result.status).toBe(TenantStatus.SUSPENDED);
    });
  });
});
