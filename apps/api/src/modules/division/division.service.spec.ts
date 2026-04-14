import { Test, TestingModule } from '@nestjs/testing';
import { DivisionService } from './division.service';

describe('DivisionService', () => {
  let service: DivisionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DivisionService],
    }).compile();

    service = module.get<DivisionService>(DivisionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllBySeason', () => {
    it('should return an empty array', () => {
      expect(service.findAllBySeason('season-1')).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return an object with the given id', () => {
      expect(service.findOne('div-1')).toEqual({ id: 'div-1' });
    });
  });

  describe('create', () => {
    it('should return a new division with the given seasonId', () => {
      const dto = {
        name: 'Monday Division',
        slug: 'monday',
        format: 'TEAMS' as const,
      };
      const result = service.create('season-1', dto);
      expect(result).toMatchObject({ seasonId: 'season-1' });
    });
  });

  describe('update', () => {
    it('should return an object with the given id', () => {
      const dto = { name: 'Updated Division' };
      expect(service.update('div-1', dto)).toEqual({ id: 'div-1' });
    });
  });

  describe('softDelete', () => {
    it('should return an object with id and archivedAt set', () => {
      const result = service.softDelete('div-1');
      expect(result.id).toBe('div-1');
      expect(result.archivedAt).toBeInstanceOf(Date);
    });
  });
});
