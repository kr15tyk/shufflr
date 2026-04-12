import { Injectable } from '@nestjs/common';
import { CreateSeasonDto, UpdateSeasonDto } from './dto/season.dto';

@Injectable()
export class SeasonService {
  findAll() {
    return [];
  }

  findOne(id: string) {
    return { id };
  }

  create(_dto: CreateSeasonDto) {
    return { id: '' };
  }

  update(id: string, _dto: UpdateSeasonDto) {
    return { id };
  }

  remove(id: string) {
    return { id };
  }
}
