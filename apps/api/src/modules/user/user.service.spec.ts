import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an empty array for findAll', () => {
    expect(service.findAll()).toEqual([]);
  });

  it('should assign a role', () => {
    const result = service.assignRole('user-1', 'PLAYER');
    expect(result).toEqual({ id: 'user-1', role: 'PLAYER' });
  });
});
