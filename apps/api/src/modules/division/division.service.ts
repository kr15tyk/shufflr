import { Injectable } from '@nestjs/common';
import { CreateDivisionDto, UpdateDivisionDto } from './dto/division.dto';

@Injectable()
export class DivisionService {
  findAllBySeason(_seasonId: string) {
    return [];
  }

  findOne(id: string) {
    return { id };
  }

  create(seasonId: string, _dto: CreateDivisionDto) {
    return { id: '', seasonId };
  }

  update(id: string, _dto: UpdateDivisionDto) {
    return { id };
  }

  softDelete(id: string) {
    return { id, archivedAt: new Date() };
  }
}
