import { Test, TestingModule } from '@nestjs/testing';
import { TenantMiddleware } from './tenant.middleware';
import { Request, Response } from 'express';

describe('TenantMiddleware', () => {
  let middleware: TenantMiddleware;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TenantMiddleware],
    }).compile();

    middleware = module.get<TenantMiddleware>(TenantMiddleware);
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should set orgId from x-org-subdomain header', () => {
    const req = { headers: { 'x-org-subdomain': 'my-org' } } as unknown as Request;
    const res = {} as unknown as Response;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(req.orgId).toBe('my-org');
    expect(next).toHaveBeenCalled();
  });

  it('should not set orgId if header is absent', () => {
    const req = { headers: {} } as unknown as Request;
    const res = {} as unknown as Response;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(req.orgId).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });
});
