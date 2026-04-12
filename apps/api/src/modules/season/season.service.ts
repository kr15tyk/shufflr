import { Injectable } from '@nestjs/common';

@Injectable()
export class SeasonService {
  findAll() {
    return [];
  }

  findOne(id: string) {
    return { id };
  }

  create(_data: Record<string, unknown>) {
    return { id: '' };
  }

  update(id: string, _data: Record<string, unknown>) {
    return { id };
  }

  remove(id: string) {
    return { id };
  }
}
