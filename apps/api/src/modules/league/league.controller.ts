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
import { LeagueService } from './league.service';
import { CreateLeagueDto, UpdateLeagueDto } from './dto/league.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('leagues')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeagueController {
  constructor(private readonly leagueService: LeagueService) {}

  @Get()
  findAll() {
    return this.leagueService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leagueService.findOne(id);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN)
  create(@Body() dto: CreateLeagueDto) {
    return this.leagueService.create(dto);
  }

  @Put(':id')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.LEAGUE_ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateLeagueDto) {
    return this.leagueService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN)
  remove(@Param('id') id: string) {
    return this.leagueService.remove(id);
  }
}
