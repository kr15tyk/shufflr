import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('mock-token') },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an access token on login', async () => {
    const result = await service.login({
      email: 'test@example.com',
      password: 'password',
    });
    expect(result).toHaveProperty('accessToken');
  });

  it('should return an access token on register', async () => {
    const result = await service.register({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password',
    });
    expect(result).toHaveProperty('accessToken');
  });
});
