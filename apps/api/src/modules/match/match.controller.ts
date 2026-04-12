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
import { MatchService } from './match.service';
import {
  GenerateScheduleDto,
  EnterScoreDto,
  UpdateMatchDto,
} from './dto/match.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('matches')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Get()
  findAll() {
    return this.matchService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.matchService.findOne(id);
  }

  @Post('schedule')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.LEAGUE_ADMIN)
  generateSchedule(@Body() dto: GenerateScheduleDto) {
    return this.matchService.generateSchedule(dto);
  }

  @Put(':id/score')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.LEAGUE_ADMIN)
  enterScore(@Param('id') id: string, @Body() dto: EnterScoreDto) {
    return this.matchService.enterScore(id, dto);
  }

  @Put(':id')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.LEAGUE_ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateMatchDto) {
    return this.matchService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN)
  remove(@Param('id') id: string) {
    return this.matchService.remove(id);
  }
}
