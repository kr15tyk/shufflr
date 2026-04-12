import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { SeasonService } from './season.service';
import { CreateSeasonDto, UpdateSeasonDto } from './dto/season.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('seasons')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SeasonController {
  constructor(private readonly seasonService: SeasonService) {}

  @Get()
  findAll() {
    return this.seasonService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.seasonService.findOne(id);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.LEAGUE_ADMIN)
  create(@Body() dto: CreateSeasonDto) {
    return this.seasonService.create(dto);
  }

  @Put(':id')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.LEAGUE_ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateSeasonDto) {
    return this.seasonService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN)
  remove(@Param('id') id: string) {
    return this.seasonService.remove(id);
  }
}
