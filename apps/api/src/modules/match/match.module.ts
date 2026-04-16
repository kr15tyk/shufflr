import { Module } from '@nestjs/common';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';
import { ScheduleService } from './schedule.service';
import { NotificationModule } from '../notification/notification.module';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [NotificationModule, PrismaModule],
  controllers: [MatchController],
  providers: [MatchService, ScheduleService],
  exports: [MatchService, ScheduleService],
})
export class MatchModule {}
