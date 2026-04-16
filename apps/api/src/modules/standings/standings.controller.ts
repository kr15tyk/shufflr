import { Controller, Get, Param, Query } from '@nestjs/common';
import { StandingsService } from './standings.service';

@Controller('seasons')
export class StandingsController {
  constructor(private readonly standingsService: StandingsService) {}

  @Get(':id/standings')
  getStandings(@Param('id') id: string, @Query('divisionId') divisionId?: string) {
    return this.standingsService.getStandings(id, divisionId);
  }
}
