import { Injectable } from '@nestjs/common';
import { CreateTeamDto, UpdateTeamDto } from './dto/team.dto';

@Injectable()
export class TeamService {
  findAll() {
    return [];
  }

  findOne(id: string) {
    return { id };
  }

  create(_dto: CreateTeamDto) {
    return { id: '' };
  }

  update(id: string, _dto: UpdateTeamDto) {
    return { id };
  }

  remove(id: string) {
    return { id };
  }
}
