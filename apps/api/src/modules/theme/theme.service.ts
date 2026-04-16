import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UpdateThemeSettingsDto } from './dto/theme.dto';

export const DEFAULT_THEME = {
  logoUrl: null,
  faviconUrl: null,
  primaryColor: '#4F46E5',
  secondaryColor: '#7C3AED',
  surfaceColor: null,
  textColor: null,
  fontHeading: null,
  fontBody: null,
};

/** Public-facing fields returned by both GET and PATCH – no internal DB columns. */
const THEME_SELECT = {
  organizationId: true,
  logoUrl: true,
  faviconUrl: true,
  primaryColor: true,
  secondaryColor: true,
  surfaceColor: true,
  textColor: true,
  fontHeading: true,
  fontBody: true,
} as const;

@Injectable()
export class ThemeService {
  constructor(private readonly prisma: PrismaService) {}

  async getTheme(orgId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: { themeSettings: { select: THEME_SELECT } },
    });

    if (!org) {
      throw new NotFoundException(`Organization ${orgId} not found`);
    }

    // Return stored theme or sensible defaults – both paths have the same shape.
    return org.themeSettings ?? { organizationId: orgId, ...DEFAULT_THEME };
  }

  async updateTheme(
    orgId: string,
    dto: UpdateThemeSettingsDto,
    tenantSubdomain: string | undefined,
  ) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!org) {
      throw new NotFoundException(`Organization ${orgId} not found`);
    }

    // Tenant scoping: require a subdomain context and verify it matches the target
    // org. Fail closed – omitting the x-org-subdomain header is not allowed.
    if (!tenantSubdomain) {
      throw new ForbiddenException('Tenant context is required to update organization theme');
    }

    if (org.subdomain !== tenantSubdomain) {
      throw new ForbiddenException('You can only update your own organization theme');
    }

    const themeSettings = await this.prisma.themeSettings.upsert({
      where: { organizationId: orgId },
      create: {
        organizationId: orgId,
        primaryColor: dto.primaryColor ?? DEFAULT_THEME.primaryColor,
        secondaryColor: dto.secondaryColor ?? DEFAULT_THEME.secondaryColor,
        logoUrl: dto.logoUrl,
        faviconUrl: dto.faviconUrl,
        surfaceColor: dto.surfaceColor,
        textColor: dto.textColor,
        fontHeading: dto.fontHeading,
        fontBody: dto.fontBody,
      },
      update: {
        ...(dto.logoUrl !== undefined && { logoUrl: dto.logoUrl }),
        ...(dto.faviconUrl !== undefined && { faviconUrl: dto.faviconUrl }),
        ...(dto.primaryColor !== undefined &&
          dto.primaryColor !== null && { primaryColor: dto.primaryColor }),
        ...(dto.secondaryColor !== undefined &&
          dto.secondaryColor !== null && { secondaryColor: dto.secondaryColor }),
        ...(dto.surfaceColor !== undefined && { surfaceColor: dto.surfaceColor }),
        ...(dto.textColor !== undefined && { textColor: dto.textColor }),
        ...(dto.fontHeading !== undefined && { fontHeading: dto.fontHeading }),
        ...(dto.fontBody !== undefined && { fontBody: dto.fontBody }),
      },
      select: THEME_SELECT,
    });

    return themeSettings;
  }
}
