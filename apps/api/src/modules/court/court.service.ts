import { Injectable } from '@nestjs/common';
import { CreateCourtDto, UpdateCourtDto } from './dto/court.dto';

@Injectable()
export class CourtService {
  findAll() {
    return [];
  }

  findOne(id: string) {
    return { id };
  }

  create(_dto: CreateCourtDto) {
    return { id: '' };
  }

  update(id: string, _dto: UpdateCourtDto) {
    return { id };
  }

  remove(id: string) {
    return { id };
  }
}
