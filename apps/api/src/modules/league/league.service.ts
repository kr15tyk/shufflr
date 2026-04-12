import { Injectable } from '@nestjs/common';

@Injectable()
export class LeagueService {
  findAll() {
    return [];
  }

  findOne(id: string) {
    return { id };
  }

  create(data: Record<string, unknown>) {
    return data;
  }

  update(id: string, data: Record<string, unknown>) {
    return { id, ...data };
  }

  remove(id: string) {
    return { id };
  }
}
