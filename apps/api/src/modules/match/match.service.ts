import { Injectable } from '@nestjs/common';
import { EnterScoreDto, UpdateMatchDto } from './dto/match.dto';

@Injectable()
  export class MatchService {
    findAll() {
          return [];
    }

  findOne(id: string) {
        return { id };
  }

  enterScore(id: string, _dto: EnterScoreDto) {
        return { id };
  }

  update(id: string, _dto: UpdateMatchDto) {
        return { id };
  }

  remove(id: string) {
        return { id };
  }
}
