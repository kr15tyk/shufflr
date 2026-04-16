import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';
import { ScheduleService } from './schedule.service';
import { NotificationModule } from '../notification/notification.module';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [EventEmitterModule.forFeature(), NotificationModule, PrismaModule],
  controllers: [MatchController],
  providers: [MatchService, ScheduleService],
  exports: [MatchService, ScheduleService],
})
export class MatchModule {}
