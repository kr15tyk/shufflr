import { Controller, Get, Param, Query } from '@nestjs/common';
import { StandingsService } from './standings.service';

/**
 * Standings are intentionally public — no JwtAuthGuard.
 * Leagues publish standings for players, fans, and scoreboard displays to read
 * without requiring an account.
 */
@Controller('seasons')
export class StandingsController {
  constructor(private readonly standingsService: StandingsService) {}

  @Get(':id/standings')
  getStandings(@Param('id') id: string, @Query('divisionId') divisionId?: string) {
    // Pass raw value; StandingsService normalizes blank strings to undefined
    return this.standingsService.getStandings(id, divisionId);
  }
}
