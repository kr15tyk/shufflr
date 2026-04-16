import { Controller, Get, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { ThemeService } from './theme.service';
import { UpdateThemeSettingsDto } from './dto/theme.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('organizations/:orgId/theme')
export class ThemeController {
  constructor(private readonly themeService: ThemeService) {}

  @Get()
  getTheme(@Param('orgId') orgId: string) {
    return this.themeService.getTheme(orgId);
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORG_ADMIN)
  updateTheme(
    @Param('orgId') orgId: string,
    @Body() dto: UpdateThemeSettingsDto,
    @CurrentUser() user: { userId: string; roles: Role[] },
    @Req() req: Request,
  ) {
    return this.themeService.updateTheme(orgId, dto, user.userId, req.orgId);
  }
}
