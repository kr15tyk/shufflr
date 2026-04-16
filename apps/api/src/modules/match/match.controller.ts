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
  ApproveScoreDto,
  EnterScoreDto,
  RejectScoreDto,
  SubmitScoreDto,
  UpdateMatchDto,
} from './dto/match.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';
import { AuthenticatedUser } from './match.service';

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

  @Put(':id/score')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.LEAGUE_ADMIN)
  enterScore(@Param('id') id: string, @Body() dto: EnterScoreDto) {
    return this.matchService.enterScore(id, dto);
  }

  @Post(':id/submit-score')
  @Roles(Role.PLAYER, Role.ORG_ADMIN, Role.LEAGUE_ADMIN, Role.SUPER_ADMIN)
  submitScore(
    @Param('id') id: string,
    @Body() dto: SubmitScoreDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.matchService.submitScore(id, dto, user);
  }

  @Post(':id/approve-score')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.LEAGUE_ADMIN)
  approveScore(
    @Param('id') id: string,
    @Body() dto: ApproveScoreDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.matchService.approveScore(id, dto, user);
  }

  @Post(':id/reject-score')
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.LEAGUE_ADMIN)
  rejectScore(
    @Param('id') id: string,
    @Body() dto: RejectScoreDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.matchService.rejectScore(id, dto, user);
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
