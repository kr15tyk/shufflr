import { Test, TestingModule } from '@nestjs/testing';
import { NotImplementedException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw NotImplementedException on login', async () => {
    await expect(
      service.login({ email: 'test@example.com', password: 'password' }),
    ).rejects.toThrow(NotImplementedException);
  });

  it('should throw NotImplementedException on register', async () => {
    await expect(
      service.register({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password',
      }),
    ).rejects.toThrow(NotImplementedException);
  });
});
