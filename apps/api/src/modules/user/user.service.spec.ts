import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Role } from '../../common/enums/role.enum';

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

  it('should assign a role using the Role enum', () => {
    const result = service.assignRole('user-1', Role.PLAYER);
    expect(result).toEqual({ id: 'user-1', role: Role.PLAYER });
  });
});
