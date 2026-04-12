import { Injectable } from '@nestjs/common';
import { CreatePlayerDto, UpdatePlayerDto } from './dto/player.dto';

@Injectable()
export class PlayerService {
  findAll() {
    return [];
  }

  findOne(id: string) {
    return { id };
  }

  create(_dto: CreatePlayerDto) {
    return { id: '' };
  }

  update(id: string, _dto: UpdatePlayerDto) {
    return { id };
  }

  remove(id: string) {
    return { id };
  }
}
