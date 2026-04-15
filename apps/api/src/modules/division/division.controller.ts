import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { DivisionService } from './division.service';
import { CreateDivisionDto, UpdateDivisionDto } from './dto/division.dto';
import { ScheduleService } from '../match/schedule.service';
import { DivisionScheduleBodyDto, GenerateScheduleBodyDto } from '../match/dto/match.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('seasons/:seasonId/divisions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DivisionController {
  constructor(private readonly divisionService: DivisionService) {}

  @Get()
  findAll(@Param('seasonId') seasonId: string) {
    return this.divisionService.findAllBySeason(seasonId);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.LEAGUE_ADMIN)
  create(@Param('seasonId') seasonId: string, @Body() dto: CreateDivisionDto) {
    return this.divisionService.create(seasonId, dto);
  }
}

@Controller('divisions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DivisionByIdController {
  constructor(
    private readonly divisionService: DivisionService,
    private readonly scheduleService: ScheduleService,
  ) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.divisionService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.LEAGUE_ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateDivisionDto) {
    return this.divisionService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.LEAGUE_ADMIN)
  remove(@Param('id') id: string) {
    return this.divisionService.softDelete(id);
  }

  /**
   * POST /divisions/:id/generate-schedule
   *
   * Generates a round-robin schedule for the specified division.
   * The divisionId is taken from the URL param; seasonId must be supplied in the body.
   *
   * TODO: validate that the division belongs to the authenticated user's organisation
   *       once the DivisionService is backed by a real database.
   */
  @Post(':id/generate-schedule')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.LEAGUE_ADMIN)
  generateSchedule(@Param('id') divisionId: string, @Body() dto: DivisionScheduleBodyDto) {
    // Build the GenerateScheduleBodyDto explicitly, taking divisionId from the URL param
    // and all other fields from the request body.
    const scheduleDto: GenerateScheduleBodyDto = {
      divisionId,
      teamIds: dto.teamIds,
      courtIds: dto.courtIds,
      dates: dto.dates,
      maxMatchesPerDayPerTeam: dto.maxMatchesPerDayPerTeam,
      blockedDates: dto.blockedDates,
    };
    return this.scheduleService.generateSchedule(dto.seasonId, scheduleDto);
  }
}

