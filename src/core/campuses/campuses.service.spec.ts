import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CampusesService } from './campuses.service';
import { CampusesRepository } from './campuses.repository';
import { TenantsRepository } from '../tenants/tenants.repository';

const mockTenant = {
  id: 'tenant-uuid-1',
  name: 'Delhi Public School',
  type: 'SCHOOL',
  status: 'ACTIVE',
};

const mockCampus = {
  id: 'campus-uuid-1',
  tenantId: 'tenant-uuid-1',
  name: 'Noida Branch',
  code: 'DPS-NOI',
  address: 'Sector 62',
  city: 'Noida',
  state: 'UP',
  pincode: '201301',
  phoneNumber: '+919876543210',
  email: 'noida@dps.com',
  isMainBranch: true,
  isActive: true,
  isDeleted: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('CampusesService', () => {
  let service: CampusesService;
  let campusesRepository: CampusesRepository;
  let tenantsRepository: TenantsRepository;

  const mockCampusesRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    unsetMainBranches: jest.fn(),
  };

  const mockTenantsRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampusesService,
        {
          provide: CampusesRepository,
          useValue: mockCampusesRepository,
        },
        {
          provide: TenantsRepository,
          useValue: mockTenantsRepository,
        },
      ],
    }).compile();

    service = module.get<CampusesService>(CampusesService);
    campusesRepository = module.get<CampusesRepository>(CampusesRepository);
    tenantsRepository = module.get<TenantsRepository>(TenantsRepository);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create campus when tenant exists', async () => {
      mockTenantsRepository.findById.mockResolvedValue(mockTenant);
      mockCampusesRepository.create.mockResolvedValue(mockCampus);

      const result = await service.create({
        tenantId: 'tenant-uuid-1',
        name: 'Noida Branch',
        code: 'DPS-NOI',
        isMainBranch: true,
      });

      expect(mockTenantsRepository.findById).toHaveBeenCalledWith('tenant-uuid-1');
      expect(mockCampusesRepository.unsetMainBranches).toHaveBeenCalledWith('tenant-uuid-1');
      expect(mockCampusesRepository.create).toHaveBeenCalled();
      expect(result).toEqual(mockCampus);
    });

    it('should throw NotFoundException if tenant does not exist', async () => {
      mockTenantsRepository.findById.mockResolvedValue(null);

      await expect(
        service.create({
          tenantId: 'non-existent-tenant',
          name: 'Noida Branch',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return list of campuses with total', async () => {
      const mockResult = { campuses: [mockCampus], total: 1 };
      mockCampusesRepository.findAll.mockResolvedValue(mockResult);

      const result = await service.findAll('tenant-uuid-1', 1, 10, 'noida');

      expect(mockCampusesRepository.findAll).toHaveBeenCalledWith('tenant-uuid-1', 1, 10, 'noida');
      expect(result).toEqual(mockResult);
    });
  });

  describe('findOne', () => {
    it('should return campus by id', async () => {
      mockCampusesRepository.findById.mockResolvedValue(mockCampus);

      const result = await service.findOne('campus-uuid-1');
      expect(result).toEqual(mockCampus);
    });

    it('should throw NotFoundException if campus not found', async () => {
      mockCampusesRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update campus details', async () => {
      mockCampusesRepository.findById.mockResolvedValue(mockCampus);
      mockCampusesRepository.update.mockResolvedValue({
        ...mockCampus,
        name: 'Greater Noida Branch',
      });

      const result = await service.update('campus-uuid-1', {
        name: 'Greater Noida Branch',
      });

      expect(result.name).toBe('Greater Noida Branch');
    });
  });

  describe('softDelete', () => {
    it('should soft delete campus', async () => {
      mockCampusesRepository.findById.mockResolvedValue(mockCampus);
      mockCampusesRepository.softDelete.mockResolvedValue({
        ...mockCampus,
        isDeleted: true,
        isActive: false,
      });

      const result = await service.softDelete('campus-uuid-1');
      expect(result.isDeleted).toBe(true);
    });
  });
});
