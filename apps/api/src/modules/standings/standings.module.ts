import { Module } from '@nestjs/common';
import { StandingsController } from './standings.controller';
import { StandingsService } from './standings.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StandingsController],
  providers: [StandingsService],
  exports: [StandingsService],
})
export class StandingsModule {}
