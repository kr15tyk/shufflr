import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationService } from './organization.service';

describe('OrganizationService', () => {
  let service: OrganizationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrganizationService],
    }).compile();

    service = module.get<OrganizationService>(OrganizationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an empty array for findAll', () => {
    expect(service.findAll()).toEqual([]);
  });

  it('should return an object with id for findOne', () => {
    expect(service.findOne('1')).toEqual({ id: '1' });
  });
});
