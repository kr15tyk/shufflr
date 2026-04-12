import { Injectable } from '@nestjs/common';

@Injectable()
export class MatchService {
  findAll() {
    return [];
  }

  findOne(id: string) {
    return { id };
  }

  generateSchedule(data: Record<string, unknown>) {
    return data;
  }

  enterScore(id: string, score: Record<string, unknown>) {
    return { id, ...score };
  }

  update(id: string, data: Record<string, unknown>) {
    return { id, ...data };
  }

  remove(id: string) {
    return { id };
  }
}
