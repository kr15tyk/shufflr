import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { DEFAULT_THEME } from '../theme/theme.service';

describe('OrganizationService', () => {
  let service: OrganizationService;
  let prismaMock: {
    organization: {
      findUnique: jest.Mock;
    };
  };

  beforeEach(async () => {
    prismaMock = {
      organization: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [OrganizationService, { provide: PrismaService, useValue: prismaMock }],
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

  // ── resolveBySlug ─────────────────────────────────────────────────────────

  describe('resolveBySlug', () => {
    it('returns organizationId, name, and stored theme when org exists', async () => {
      const storedTheme = {
        logoUrl: 'https://example.com/logo.png',
        faviconUrl: null,
        primaryColor: '#123456',
        secondaryColor: '#654321',
        surfaceColor: null,
        textColor: null,
        fontHeading: null,
        fontBody: null,
      };

      prismaMock.organization.findUnique.mockResolvedValue({
        id: 'org-1',
        name: 'Demo Sports Club',
        subdomain: 'demo',
        themeSettings: storedTheme,
      });

      const result = await service.resolveBySlug('demo');

      expect(result).toEqual({
        organizationId: 'org-1',
        name: 'Demo Sports Club',
        theme: storedTheme,
      });
    });

    it('returns default theme when org has no themeSettings', async () => {
      prismaMock.organization.findUnique.mockResolvedValue({
        id: 'org-2',
        name: 'Another Org',
        subdomain: 'another',
        themeSettings: null,
      });

      const result = await service.resolveBySlug('another');

      expect(result).toEqual({
        organizationId: 'org-2',
        name: 'Another Org',
        theme: DEFAULT_THEME,
      });
    });

    it('throws NotFoundException when slug does not match any org', async () => {
      prismaMock.organization.findUnique.mockResolvedValue(null);

      await expect(service.resolveBySlug('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
