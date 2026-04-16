import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from './dto/organization.dto';
import { DEFAULT_THEME } from '../theme/theme.service';

/** Fields exposed by the resolve endpoint – no internal timestamps. */
const RESOLVE_THEME_SELECT = {
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
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveBySlug(slug: string) {
    const org = await this.prisma.organization.findUnique({
      where: { subdomain: slug },
      include: { themeSettings: { select: RESOLVE_THEME_SELECT } },
    });

    if (!org) {
      throw new NotFoundException(`Organization with slug "${slug}" not found`);
    }

    return {
      organizationId: org.id,
      name: org.name,
      theme: org.themeSettings ?? DEFAULT_THEME,
    };
  }

  findAll() {
    return [];
  }

  findOne(id: string) {
    return { id };
  }

  create(_dto: CreateOrganizationDto) {
    return { id: '' };
  }

  update(id: string, _dto: UpdateOrganizationDto) {
    return { id };
  }

  remove(id: string) {
    return { id };
  }
}
