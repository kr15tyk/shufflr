import { Injectable } from '@nestjs/common';

@Injectable()
export class MatchService {
  findAll() {
    return [];
  }

  findOne(id: string) {
    return { id };
  }

  generateSchedule(_data: Record<string, unknown>) {
    return { id: '' };
  }

  enterScore(id: string, _score: Record<string, unknown>) {
    return { id };
  }

  update(id: string, _data: Record<string, unknown>) {
    return { id };
  }

  remove(id: string) {
    return { id };
  }
}
