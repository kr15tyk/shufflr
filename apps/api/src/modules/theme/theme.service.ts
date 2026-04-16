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

@Injectable()
export class ThemeService {
  constructor(private readonly prisma: PrismaService) {}

  async getTheme(orgId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: { themeSettings: true },
    });

    if (!org) {
      throw new NotFoundException(`Organization ${orgId} not found`);
    }

    return org.themeSettings ?? { organizationId: orgId, ...DEFAULT_THEME };
  }

  async updateTheme(
    orgId: string,
    dto: UpdateThemeSettingsDto,
    _requestingUserId: string,
    tenantSubdomain: string | undefined,
  ) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!org) {
      throw new NotFoundException(`Organization ${orgId} not found`);
    }

    // Validate that the request comes from the same tenant (subdomain check)
    if (tenantSubdomain && org.subdomain !== tenantSubdomain) {
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
        ...(dto.primaryColor !== undefined && { primaryColor: dto.primaryColor }),
        ...(dto.secondaryColor !== undefined && { secondaryColor: dto.secondaryColor }),
        ...(dto.surfaceColor !== undefined && { surfaceColor: dto.surfaceColor }),
        ...(dto.textColor !== undefined && { textColor: dto.textColor }),
        ...(dto.fontHeading !== undefined && { fontHeading: dto.fontHeading }),
        ...(dto.fontBody !== undefined && { fontBody: dto.fontBody }),
      },
    });

    return themeSettings;
  }
}
