import { Module } from '@nestjs/common';
import { DivisionController, DivisionByIdController } from './division.controller';
import { DivisionService } from './division.service';

@Module({
  controllers: [DivisionController, DivisionByIdController],
  providers: [DivisionService],
  exports: [DivisionService],
})
export class DivisionModule {}
