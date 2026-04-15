import { Module } from '@nestjs/common';
import { DivisionController, DivisionByIdController } from './division.controller';
import { DivisionService } from './division.service';
import { MatchModule } from '../match/match.module';

@Module({
  imports: [MatchModule],
  controllers: [DivisionController, DivisionByIdController],
  providers: [DivisionService],
  exports: [DivisionService],
})
export class DivisionModule {}
