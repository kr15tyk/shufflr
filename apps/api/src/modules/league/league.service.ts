import { Injectable } from '@nestjs/common';
import { CreateLeagueDto, UpdateLeagueDto } from './dto/league.dto';

@Injectable()
export class LeagueService {
  findAll() {
    return [];
  }

  findOne(id: string) {
    return { id };
  }

  create(_dto: CreateLeagueDto) {
    return { id: '' };
  }

  update(id: string, _dto: UpdateLeagueDto) {
    return { id };
  }

  remove(id: string) {
    return { id };
  }
}
