import { Injectable } from '@nestjs/common';
import {
  GenerateScheduleDto,
  EnterScoreDto,
  UpdateMatchDto,
} from './dto/match.dto';

@Injectable()
export class MatchService {
  findAll() {
    return [];
  }

  findOne(id: string) {
    return { id };
  }

  generateSchedule(_dto: GenerateScheduleDto) {
    return { id: '' };
  }

  enterScore(id: string, _dto: EnterScoreDto) {
    return { id };
  }

  update(id: string, _dto: UpdateMatchDto) {
    return { id };
  }

  remove(id: string) {
    return { id };
  }
}
