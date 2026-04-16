import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ThemeService, DEFAULT_THEME } from './theme.service';
import { PrismaService } from '../../common/prisma/prisma.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let prismaMock: {
    organization: {
      findUnique: jest.Mock;
    };
    themeSettings: {
      upsert: jest.Mock;
    };
  };

  beforeEach(async () => {
    prismaMock = {
      organization: {
        findUnique: jest.fn(),
      },
      themeSettings: {
        upsert: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ThemeService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();

    service = module.get<ThemeService>(ThemeService);
  });

  // ── getTheme ──────────────────────────────────────────────────────────────

  describe('getTheme', () => {
    it('returns sensible defaults when no theme is set', async () => {
      prismaMock.organization.findUnique.mockResolvedValue({
        id: 'org-1',
        subdomain: 'demo',
        themeSettings: null,
      });

      const result = await service.getTheme('org-1');

      expect(result).toMatchObject({
        organizationId: 'org-1',
        ...DEFAULT_THEME,
      });
    });

    it('returns the stored theme when one exists', async () => {
      const stored = {
        id: 'theme-1',
        organizationId: 'org-1',
        primaryColor: '#FF0000',
        secondaryColor: '#00FF00',
        logoUrl: 'https://example.com/logo.png',
        faviconUrl: null,
        surfaceColor: null,
        textColor: null,
        fontHeading: null,
        fontBody: null,
      };

      prismaMock.organization.findUnique.mockResolvedValue({
        id: 'org-1',
        subdomain: 'demo',
        themeSettings: stored,
      });

      const result = await service.getTheme('org-1');

      expect(result).toEqual(stored);
    });

    it('throws NotFoundException for an unknown org', async () => {
      prismaMock.organization.findUnique.mockResolvedValue(null);

      await expect(service.getTheme('unknown-org')).rejects.toThrow(NotFoundException);
    });
  });

  // ── updateTheme ───────────────────────────────────────────────────────────

  describe('updateTheme', () => {
    it('upserts and returns updated theme when org admin updates their own org', async () => {
      prismaMock.organization.findUnique.mockResolvedValue({
        id: 'org-1',
        subdomain: 'demo',
      });

      const updatedTheme = {
        id: 'theme-1',
        organizationId: 'org-1',
        primaryColor: '#123456',
        secondaryColor: '#654321',
        logoUrl: null,
        faviconUrl: null,
        surfaceColor: null,
        textColor: null,
        fontHeading: null,
        fontBody: null,
      };
      prismaMock.themeSettings.upsert.mockResolvedValue(updatedTheme);

      const result = await service.updateTheme(
        'org-1',
        { primaryColor: '#123456', secondaryColor: '#654321' },
        'user-1',
        'demo',
      );

      expect(result).toEqual(updatedTheme);
      expect(prismaMock.themeSettings.upsert).toHaveBeenCalledTimes(1);
    });

    it('throws ForbiddenException when tenant subdomain does not match org — tenant scoping', async () => {
      prismaMock.organization.findUnique.mockResolvedValue({
        id: 'org-b',
        subdomain: 'org-b',
      });

      // User belongs to 'org-a' tenant, but tries to update 'org-b'
      await expect(
        service.updateTheme('org-b', { primaryColor: '#AABBCC' }, 'user-from-a', 'org-a'),
      ).rejects.toThrow(ForbiddenException);

      expect(prismaMock.themeSettings.upsert).not.toHaveBeenCalled();
    });

    it('allows update when no subdomain context is present (e.g. SUPER_ADMIN via direct API)', async () => {
      prismaMock.organization.findUnique.mockResolvedValue({
        id: 'org-1',
        subdomain: 'demo',
      });

      prismaMock.themeSettings.upsert.mockResolvedValue({
        id: 'theme-1',
        organizationId: 'org-1',
        primaryColor: '#AABBCC',
        secondaryColor: '#4F46E5',
      });

      await expect(
        service.updateTheme('org-1', { primaryColor: '#AABBCC' }, 'admin-user', undefined),
      ).resolves.toBeDefined();
    });

    it('throws NotFoundException when org does not exist', async () => {
      prismaMock.organization.findUnique.mockResolvedValue(null);

      await expect(
        service.updateTheme('missing-org', { primaryColor: '#FFFFFF' }, 'user-1', 'demo'),
      ).rejects.toThrow(NotFoundException);
    });

    it('uses DEFAULT_THEME values for required fields when creating a theme without them', async () => {
      prismaMock.organization.findUnique.mockResolvedValue({
        id: 'org-1',
        subdomain: 'demo',
      });

      prismaMock.themeSettings.upsert.mockResolvedValue({
        organizationId: 'org-1',
        primaryColor: DEFAULT_THEME.primaryColor,
        secondaryColor: DEFAULT_THEME.secondaryColor,
      });

      await service.updateTheme(
        'org-1',
        { logoUrl: 'https://example.com/logo.png' },
        'user-1',
        'demo',
      );

      expect(prismaMock.themeSettings.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            primaryColor: DEFAULT_THEME.primaryColor,
            secondaryColor: DEFAULT_THEME.secondaryColor,
          }),
        }),
      );
    });
  });
});
