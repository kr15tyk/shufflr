import { Module } from '@nestjs/common';
import { SeasonController } from './season.controller';
import { SeasonService } from './season.service';
import { MatchModule } from '../match/match.module';

@Module({
  imports: [MatchModule],
  controllers: [SeasonController],
  providers: [SeasonService],
  exports: [SeasonService],
})
export class SeasonModule {}
