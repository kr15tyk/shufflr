import { Module } from '@nestjs/common';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';
import { ScheduleService } from './schedule.service';

@Module({
  controllers: [MatchController],
  providers: [MatchService, ScheduleService],
  exports: [MatchService, ScheduleService],
})
export class MatchModule {}
